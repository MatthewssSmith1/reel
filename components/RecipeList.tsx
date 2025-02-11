import { ThemedText as Text } from '@/components/ThemedText';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  items: string[];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  ordered?: boolean;
}

export const RecipeList = ({ title, items, icon, ordered = false }: Props) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={ordered ? styles.orderedPrefix : styles.unorderedPrefix}>
            {ordered ? `${index + 1}.` : '•'}
          </Text>
          <Text>{item}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    padding: 6,
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
  },
  item: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    paddingRight: 35,
    marginLeft: 6,
  },
  orderedPrefix: {
    color: '#777',
    fontWeight: 'bold',
    minWidth: 15,
  },
  unorderedPrefix: {
    color: '#777',
    fontWeight: 'bold',
    marginRight: 7,
    transform: [{ scale: 1.5 }],
  },
}); 