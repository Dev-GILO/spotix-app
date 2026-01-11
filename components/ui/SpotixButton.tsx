import { Pressable, Text, StyleSheet } from "react-native";
import { SpotixTheme } from "@/constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

export default function SpotixButton({ title, onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={styles.text}>
        {loading ? "Signing in..." : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: SpotixTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: SpotixTheme.radius.md,
    alignItems: "center",
    marginTop: SpotixTheme.spacing.lg,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
