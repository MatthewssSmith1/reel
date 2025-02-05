import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { formatCount } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';

export type ToolbarButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  count?: number;
  color?: string;
  onPress?: () => void;
};

export function ToolbarButton({ name, count, color = '#fff', onPress }: ToolbarButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons  name={name} size={36} color={color} />
      {count !== undefined && (
        <Text style={styles.count}>{formatCount(count)}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  count: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
    fontWeight: 'bold',
  },
}); 