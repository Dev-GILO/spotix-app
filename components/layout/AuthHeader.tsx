import { View, Text, StyleSheet, Image } from "react-native";
import { SpotixTheme } from "@/constants/theme";

export default function AuthHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue to Spotix</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SpotixTheme.spacing.xl,
  },
  logo: {
    height: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: SpotixTheme.colors.primary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: SpotixTheme.colors.muted,
  },
});
