import { StyleSheet, TouchableOpacity, TextInput, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { ReactNode, forwardRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export const ICON_SIZE = 18;

type ChatModalProps = {
  children: ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  leftButton?: ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
  paddingTop?: number;
  disabled?: boolean;
};

export const ChatModal = forwardRef<TextInput, ChatModalProps>(({ 
  children, 
  value, 
  onChangeText, 
  onSubmit,
  placeholder = "Write a message...",
  leftButton,
  iconName = "paper-plane",
  paddingTop = 0,
  disabled = false,
}, ref) => {
  const isKeyboardVisible = useKeyboardVisibility();
  const { bottom } = useSafeAreaInsets();

  const defaultLeftButton = (
    <TouchableOpacity 
      style={[styles.button, !isKeyboardVisible && { opacity: 0.5 }]} 
      onPress={() => Keyboard.dismiss()}
      disabled={!isKeyboardVisible}
    >
      <Ionicons name="chevron-down" color="white" size={ICON_SIZE} />
    </TouchableOpacity>
  );

  const handleSubmit = () => {
    onSubmit();
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      style={styles.container}
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.sheet, { paddingTop }]}>
        {children}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(bottom, 10) }]}>
          {leftButton || defaultLeftButton}
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={handleSubmit}
            editable={!disabled}
            multiline
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit}
            disabled={disabled}
          >
            <Ionicons name={iconName} color="white" size={ICON_SIZE} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheet: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(27, 27, 27, 0.9)',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 10,
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    maxHeight: 100,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 