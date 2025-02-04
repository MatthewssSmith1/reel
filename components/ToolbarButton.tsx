import { StyleSheet, View, Pressable, Text } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { formatCount } from '@/lib/utils';

interface ToolbarButtonProps {
  name: IconSymbolName;
  onPress?: () => void;
  count?: number;
}

export function ToolbarButton({ name, onPress, count }: ToolbarButtonProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 }
        ]}
        onPress={onPress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true }}
      >
        <IconSymbol 
          name={name} 
          size={38} 
          color={"white"} 
        />
      </Pressable>
      {count !== undefined && (
        <Text style={styles.count}>{formatCount(count)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
}); 