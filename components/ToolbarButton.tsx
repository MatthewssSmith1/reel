import { StyleSheet, View, Pressable, Text } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { formatCount } from '@/lib/utils';
import { TouchableOpacity } from 'react-native';

export type ToolbarButtonProps = {
  name: IconSymbolName;
  count?: number;
  color?: string;
  onPress?: () => void;
};

export function ToolbarButton({ name, count, color = '#fff', onPress }: ToolbarButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <IconSymbol 
        name={name} 
        size={28} 
        color={color} 
      />
      {count !== undefined && (
        <Text style={styles.count}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  count: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
}); 