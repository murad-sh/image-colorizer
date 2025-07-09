import {
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  buttonStyles?: StyleProp<ViewStyle>;
  labelStyles?: StyleProp<TextStyle>;
};

export const PrimaryButton = ({
  label,
  onPress,
  buttonStyles,
  labelStyles,
}: PrimaryButtonProps) => {
  return (
    <Pressable style={[styles.button, buttonStyles]} onPress={onPress}>
      <Text style={[styles.label, labelStyles]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
});
