import { Recipe } from '@/lib/firebase';

export const RECIPES: Recipe[] = [
  {
    title: "Smashed Beef Patty Burger",
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    servings: 1,
    tags: [
      "Easy",
      "Burger",
      "Beef",
      "American"
    ],
    ingredients: [
      "Brioche bun",
      "Beef patty",
      "Caramelized onions",
      "Aged cheddar cheese",
      "Secret sauce"
    ],
    equipment: [
      "Frying pan",
      "Spatula"
    ],
    steps: [
      "Smash beef patty on a hot griddle.",
      "Cook until browned and crispy.",
      "Top with caramelized onions and aged cheddar.",
      "Place patty on brioche bun.",
      "Add secret sauce."
    ],
  },
  {
    title: "San Marzano Tomato Sauce",
    prepTime: "15 minutes",
    cookTime: "2 hours",
    servings: 4,
    tags: [
      "Italian",
      "Sauce",
      "Vegetarian",
      "Slow-cooked"
    ],
    ingredients: [
      "San Marzano tomatoes",
      "Garlic cloves",
      "Fresh basil",
      "Olive oil",
      "Salt",
      "Black pepper"
    ],
    equipment: [
      "Large pot",
      "Wooden spoon",
      "Garlic press"
    ],
    steps: [
      "Heat olive oil in a large pot over medium heat.",
      "Add minced garlic and sauté until fragrant.",
      "Add San Marzano tomatoes and crush them.",
      "Add fresh basil leaves.",
      "Simmer on low heat for 2 hours, stirring occasionally.",
      "Season with salt and pepper to taste."
    ],
  },
  {
    title: "Blistered Cherry Tomatoes",
    prepTime: "5 minutes",
    cookTime: "10 minutes",
    servings: 2,
    tags: [
      "Side Dish",
      "Vegetarian",
      "Quick",
      "Mediterranean"
    ],
    ingredients: [
      "Cherry tomatoes",
      "Garlic cloves",
      "Fresh thyme",
      "Flaky salt",
      "Aged balsamic vinegar",
      "Olive oil"
    ],
    equipment: [
      "Cast iron skillet",
      "Tongs"
    ],
    steps: [
      "Heat cast iron skillet until very hot.",
      "Add olive oil and cherry tomatoes.",
      "Add crushed garlic cloves and thyme sprigs.",
      "Cook until tomatoes begin to blister and burst.",
      "Season with flaky salt.",
      "Finish with a drizzle of aged balsamic vinegar."
    ],
  },
  {
    title: "Seasoned Edamame",
    prepTime: "5 minutes",
    cookTime: "5 minutes",
    servings: 2,
    tags: [
      "Japanese",
      "Appetizer",
      "Vegetarian",
      "Quick"
    ],
    ingredients: [
      "Edamame pods",
      "Maldon salt",
      "Togarashi seasoning",
      "Sesame oil",
      "Lemon"
    ],
    equipment: [
      "Steamer basket",
      "Pot",
      "Mixing bowl"
    ],
    steps: [
      "Steam edamame pods until tender.",
      "Transfer to mixing bowl.",
      "Toss with sesame oil.",
      "Season with Maldon salt and togarashi.",
      "Char lemon halves and serve on the side."
    ],
  },
  {
    title: "Classic Cacio e Pepe",
    prepTime: "5 minutes",
    cookTime: "15 minutes",
    servings: 2,
    tags: [
      "Italian",
      "Pasta",
      "Vegetarian",
      "Classic"
    ],
    ingredients: [
      "Spaghetti",
      "Fresh pecorino romano",
      "Black peppercorns",
      "Salt",
      "Pasta water"
    ],
    equipment: [
      "Large pot",
      "Pan",
      "Cheese grater",
      "Pepper mill"
    ],
    steps: [
      "Cook spaghetti in salted water until al dente.",
      "Toast freshly cracked black pepper in a pan.",
      "Reserve pasta water before draining.",
      "Create emulsion with pasta water and grated pecorino.",
      "Toss pasta with cheese and pepper mixture until creamy."
    ],
  },
  {
    title: "Orecchiette with Broccoli",
    prepTime: "20 minutes",
    cookTime: "25 minutes",
    servings: 4,
    tags: [
      "Italian",
      "Pasta",
      "Homemade",
      "Traditional"
    ],
    ingredients: [
      "Handmade orecchiette",
      "Broccoli",
      "Italian sausage",
      "Chili flakes",
      "Breadcrumbs",
      "Garlic",
      "Olive oil"
    ],
    equipment: [
      "Large pot",
      "Sauté pan",
      "Colander"
    ],
    steps: [
      "Make orecchiette pasta by hand.",
      "Blanch broccoli in salted water.",
      "Brown Italian sausage in pan.",
      "Toast breadcrumbs with garlic and chili flakes.",
      "Combine pasta with sausage and broccoli.",
      "Top with toasted breadcrumbs."
    ],
  },
  {
    title: "Japanese Soufflé Pancakes",
    prepTime: "20 minutes",
    cookTime: "15 minutes",
    servings: 2,
    tags: [
      "Japanese",
      "Breakfast",
      "Sweet",
      "Fluffy"
    ],
    ingredients: [
      "Eggs",
      "Flour",
      "Milk",
      "Maple butter",
      "Fresh berries",
      "Mascarpone cream",
      "Vanilla extract",
      "Baking powder"
    ],
    equipment: [
      "Electric mixer",
      "Non-stick pan",
      "Ring molds",
      "Spatula"
    ],
    steps: [
      "Separate egg whites and yolks.",
      "Beat egg whites until stiff peaks form.",
      "Fold egg yolk mixture into whites.",
      "Cook in ring molds on low heat.",
      "Steam pancakes by covering pan.",
      "Serve with maple butter, berries, and whipped mascarpone."
    ],
  },
  {
    title: "Ancient Grain Quinoa Bowl",
    prepTime: "15 minutes",
    cookTime: "25 minutes",
    servings: 2,
    tags: [
      "Healthy",
      "Vegetarian",
      "Bowl",
      "Mediterranean"
    ],
    ingredients: [
      "Quinoa",
      "Mixed vegetables for roasting",
      "Chickpeas",
      "Tahini",
      "Lemon",
      "Olive oil",
      "Mixed herbs"
    ],
    equipment: [
      "Baking sheet",
      "Saucepan",
      "Mixing bowls"
    ],
    steps: [
      "Cook quinoa according to package instructions.",
      "Roast mixed vegetables until tender.",
      "Crisp chickpeas in oven with spices.",
      "Make lemon-tahini dressing.",
      "Assemble bowls with quinoa base.",
      "Top with roasted vegetables and chickpeas.",
      "Drizzle with lemon-tahini dressing."
    ],
  },
  {
    title: "72-Hour Pizza Dough",
    prepTime: "30 minutes",
    cookTime: "72 hours",
    servings: 4,
    tags: [
      "Italian",
      "Bread",
      "Fermented",
      "Advanced"
    ],
    ingredients: [
      "00 flour",
      "Water",
      "Salt",
      "Active dry yeast",
      "Olive oil"
    ],
    equipment: [
      "Stand mixer",
      "Dough containers",
      "Scale",
      "Refrigerator"
    ],
    steps: [
      "Mix flour, water, and yeast.",
      "Develop gluten through kneading.",
      "Divide dough into portions.",
      "Cold ferment for 72 hours.",
      "Shape into pizza bases.",
      "Look for leopard-spotted crust when baking."
    ],
  },
  {
    title: "Charred Broccoli with Garlic Confit",
    prepTime: "15 minutes",
    cookTime: "20 minutes",
    servings: 4,
    tags: [
      "Side Dish",
      "Vegetarian",
      "Healthy",
      "Gourmet"
    ],
    ingredients: [
      "Broccoli florets",
      "Garlic cloves",
      "Olive oil",
      "Chili flakes",
      "Lemon",
      "Aged parmesan",
      "Salt"
    ],
    equipment: [
      "Baking sheet",
      "Small saucepan",
      "Microplane grater"
    ],
    steps: [
      "Confit garlic in olive oil until tender.",
      "Toss broccoli with oil and seasonings.",
      "Roast at high heat until charred.",
      "Add chili flakes and lemon zest.",
      "Top with shaved aged parmesan."
    ],
  },
  {
    title: "Honey-PB Banana Toast",
    prepTime: "10 minutes",
    cookTime: "5 minutes",
    servings: 1,
    tags: [
      "Breakfast",
      "Sweet",
      "Quick",
      "Vegetarian"
    ],
    ingredients: [
      "Sourdough bread",
      "Peanut butter",
      "Honey",
      "Bananas",
      "Maldon salt"
    ],
    equipment: [
      "Toaster",
      "Small pan",
      "Mixing bowl"
    ],
    steps: [
      "Toast sourdough until golden.",
      "Whip peanut butter with honey.",
      "Caramelize banana slices in pan.",
      "Spread whipped honey-PB on toast.",
      "Top with caramelized bananas.",
      "Finish with Maldon salt."
    ],
  },
  {
    title: "Silky Fettuccine Alfredo",
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    servings: 4,
    tags: [
      "Italian",
      "Pasta",
      "Creamy",
      "Classic"
    ],
    ingredients: [
      "Fettuccine",
      "24-month aged parmigiano",
      "Heavy cream",
      "Butter",
      "Nutmeg",
      "Fresh chives",
      "Black pepper"
    ],
    equipment: [
      "Large pot",
      "Sauté pan",
      "Cheese grater"
    ],
    steps: [
      "Cook fettuccine until al dente.",
      "Heat cream and butter in pan.",
      "Add freshly grated parmigiano.",
      "Grate fresh nutmeg into sauce.",
      "Toss pasta with sauce until silky.",
      "Garnish with chives and black pepper."
    ],
  },
  {
    title: "Triple Chocolate Layer Cake",
    prepTime: "45 minutes",
    cookTime: "35 minutes",
    servings: 12,
    tags: [
      "Dessert",
      "Chocolate",
      "Baking",
      "Special Occasion"
    ],
    ingredients: [
      "Valrhona chocolate",
      "Flour",
      "Sugar",
      "Eggs",
      "Butter",
      "Heavy cream",
      "Fresh raspberries",
      "Caramel sauce",
      "Salt"
    ],
    equipment: [
      "Stand mixer",
      "Cake pans",
      "Double boiler",
      "Offset spatula"
    ],
    steps: [
      "Bake three chocolate cake layers.",
      "Make Valrhona chocolate ganache.",
      "Prepare salted caramel sauce.",
      "Make fresh raspberry compote.",
      "Layer cake with ganache and caramel.",
      "Garnish with fresh raspberries."
    ],
  },
  {
    title: "Fresh Pomegranate Guacamole",
    prepTime: "15 minutes",
    cookTime: "0 minutes",
    servings: 4,
    tags: [
      "Mexican",
      "Appetizer",
      "Fresh",
      "Vegetarian"
    ],
    ingredients: [
      "Hass avocados",
      "Lime",
      "Fresh cilantro",
      "Serrano chilies",
      "Pomegranate seeds",
      "Red onion",
      "Salt"
    ],
    equipment: [
      "Molcajete or bowl",
      "Citrus juicer",
      "Knife"
    ],
    steps: [
      "Hand-crush ripe avocados.",
      "Finely dice serrano chilies and onion.",
      "Chop fresh cilantro.",
      "Mix in lime juice and seasonings.",
      "Top with fresh pomegranate seeds."
    ],
  },
  {
    title: "Wild Mushroom Soup",
    prepTime: "20 minutes",
    cookTime: "40 minutes",
    servings: 6,
    tags: [
      "Soup",
      "Vegetarian",
      "Gourmet",
      "Fall"
    ],
    ingredients: [
      "Shiitake mushrooms",
      "Porcini mushrooms",
      "Cremini mushrooms",
      "Vegetable stock",
      "Heavy cream",
      "Truffle oil",
      "Fresh thyme",
      "Garlic",
      "Onion"
    ],
    equipment: [
      "Large pot",
      "Immersion blender",
      "Sauté pan"
    ],
    steps: [
      "Sauté mixed mushrooms until golden.",
      "Cook aromatics until softened.",
      "Add stock and simmer.",
      "Blend until smooth.",
      "Stir in cream and thyme.",
      "Finish with truffle oil drizzle."
    ],
  },
];