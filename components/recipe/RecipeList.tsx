import { ThemedText as Text } from '@/components/ThemedText';
import { StyleSheet, View } from 'react-native';
import { RecipeListItem } from '@/components/recipe/RecipeListItem';
import { Ionicons } from '@expo/vector-icons';
import { Change } from 'diff';

type Props = {
  title: string;
  items: Change[][];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  ordered?: boolean;
  animOffset?: number;
}

export const RecipeList = ({ title, items, icon, ordered = false, animOffset = 0 }: Props) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#fff" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.list}>
        {items.map((item, index) => (
          <RecipeListItem
            key={index}
            item={item}
            index={index}
            ordered={ordered}
            animOffset={animOffset}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    gap: 12,
    width: '100%',
  }
});