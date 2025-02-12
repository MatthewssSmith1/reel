import { StyleSheet, View } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons'

type Props = {
  text: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  bgColor?: string;
}

export function Badge({ text, icon, color, bgColor }: Props) {
  return (
    <View style={[styles.badge, bgColor ? { backgroundColor: bgColor } : undefined]}>
      {icon && <Ionicons name={icon} size={16} color={color ?? '#000'} />}
      <Text style={[styles.badgeText, color ? { color } : undefined]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
  },
});
