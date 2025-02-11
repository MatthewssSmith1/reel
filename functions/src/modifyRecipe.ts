import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { buildRecipeFormatterTool } from "./tools/recipeFormatter";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onCall} from "firebase-functions/v2/https";
import { llm } from "./openai";
import { z } from "zod";

const modifyRecipeSchema = z.object({
  recipeId: z.string(),
  instruction: z.string().min(1),
})

type ModifyRecipeInput = z.infer<typeof modifyRecipeSchema>;

const modifyRecipe = onCall<ModifyRecipeInput>(async (request) => {
  try {
    if (!request.auth) throw new Error('Unauthorized');
    const uid = request.auth.uid;

    const { recipeId, instruction } = modifyRecipeSchema.parse(request.data);
    
    const db = admin.firestore();
    const recipeRef = db.collection('recipes').doc(recipeId);

    const recipeSnapshot = await recipeRef.get();
    if (!recipeSnapshot.exists) throw new Error(`Recipe ${recipeId} not found`);

    const currentRecipe = recipeSnapshot.data();
    if (!currentRecipe) throw new Error(`Recipe ${recipeId} has no data`);

    const finalState = await createWorkflow().invoke({ 
      messages: [
        new SystemMessage(
          `You are a helpful cooking assistant that modifies recipes based on user requirements. 
           Given a recipe and an instruction, modify the recipe accordingly.
           Always use the recipeFormatter tool as your final step to format the modified recipe before responding.
           
           Current recipe: ${JSON.stringify(currentRecipe)}`
        ),
        new HumanMessage(instruction)
      ]
    });

    const newRecipeData = {
      ...(await getNewRecipe(finalState.messages)),
      author_id: uid,
    };

    let resultRef;
    if (currentRecipe.parent_id) {
      await recipeRef.update(newRecipeData);
      resultRef = recipeRef;
    } else {
      resultRef = await db.collection('recipes').add({
        ...newRecipeData,
        parent_id: recipeId,
      });
    }

    const resultSnapshot = await resultRef.get();

    return { id: resultRef.id, ...resultSnapshot.data() };

  } catch (error) {
    logger.error('Modify recipe error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error('Failed to modify recipe');
  }
});

function createWorkflow() {
  const tools = [
    buildRecipeFormatterTool()
  ];
  const toolNode = new ToolNode(tools);
  
  const modelWithTools = llm.bind({ tools });
  
  async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await modelWithTools.invoke(state.messages);
    return { messages: [response] };
  }
  
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);
    
  return workflow.compile();
}

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.additional_kwargs.tool_calls) 
    return "tools";

  return "__end__";
}

async function getNewRecipe(finalMessages: BaseMessage[]) {
  for (const message of finalMessages) {
    if (message.name === "recipeFormatter") {
      const content = message.content;
      if (typeof content !== 'string') {
        logger.error('Recipe formatter returned non-string content:', content);
        throw new Error('Expected string content from recipeFormatter');
      }
      try {
        return JSON.parse(content);
      } catch (error) {
        logger.error('Failed to parse modified recipe:', error);
        throw new Error('Failed to process modified recipe');
      }
    }
  }
  logger.error('No recipeFormatter message found in final messages');
  throw new Error('No recipeFormatter output found');
}

export default modifyRecipe;
