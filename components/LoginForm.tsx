"use client"

import { useState } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import { validateEmail, validatePassword } from "@/utils/validators"

export const LoginForm = () => {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (!validatePassword(password)) {
      errors.password = "Password must be at least 6 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async () => {
    setValidationErrors({})

    if (!validate()) return

    try {
      console.log("[LoginForm] Attempting login...")
      await login(email.trim().toLowerCase(), password)
      console.log("[LoginForm] Login successful")

      // ✅ Redirect to home screen
    router.replace("/(tabs)")
    } catch (err: any) {
      console.error("[LoginForm] Login failed:", err)

      let errorMessage = "Login failed. Please try again."

      if (err?.message) {
        if (
          err.message.includes("email") ||
          err.message.includes("password")
        ) {
          errorMessage = err.message
        } else if (
          err.message.toLowerCase().includes("network")
        ) {
          errorMessage =
            "Network error. Please check your internet connection."
        } else {
          errorMessage = err.message
        }
      }

      Alert.alert("Login Failed", errorMessage, [{ text: "OK" }])
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Spotix Booker</Text>
            <Text style={styles.subtitle}>Event Access Control</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.email && styles.inputError,
                ]}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.mutedForeground}
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }))
                  }
                }}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />
              {validationErrors.email && (
                <Text style={styles.errorText}>
                  {validationErrors.email}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.password && styles.inputError,
                ]}
                placeholder="••••••"
                placeholderTextColor={COLORS.mutedForeground}
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }))
                  }
                }}
                secureTextEntry
                editable={!isLoading}
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect={false}
              />
              {validationErrors.password && (
                <Text style={styles.errorText}>
                  {validationErrors.password}
                </Text>
              )}
            </View>

            {/* API Error */}
            {error &&
              !validationErrors.email &&
              !validationErrors.password && (
                <View style={styles.apiErrorContainer}>
                  <Text style={styles.apiError}>{error}</Text>
                </View>
              )}

            {/* Button */}
            <TouchableOpacity
              style={[
                styles.button,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={COLORS.white}
                  size="small"
                />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Only authorized bookers can access this app
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  keyboardView: { flex: 1 } as ViewStyle,

  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  } as ViewStyle,

  content: { alignItems: "center" } as ViewStyle,

  header: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  } as ViewStyle,

  title: {
    ...(TYPOGRAPHY.heading1 as TextStyle),
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    fontWeight: "bold",
  } as TextStyle,

  subtitle: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
  } as TextStyle,

  form: { width: "100%", maxWidth: 400 } as ViewStyle,

  inputGroup: { marginBottom: SPACING.lg } as ViewStyle,

  label: {
    ...(TYPOGRAPHY.label as TextStyle),
    marginBottom: SPACING.sm,
    fontWeight: "600",
  } as TextStyle,

  input: {
    ...(TYPOGRAPHY.body as TextStyle),
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  } as TextStyle,

  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  } as TextStyle,

  errorText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.error,
    marginTop: SPACING.xs,
  } as TextStyle,

  apiErrorContainer: {
    marginBottom: SPACING.lg,
  } as ViewStyle,

  apiError: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.error,
    backgroundColor: COLORS.errorLight,
    padding: SPACING.sm,
    borderRadius: 6,
    textAlign: "center",
  } as TextStyle,

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: SPACING.md,
    elevation: 5,
  } as ViewStyle,

  buttonDisabled: { opacity: 0.6 } as ViewStyle,

  buttonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.white,
    fontWeight: "bold",
  } as TextStyle,

  helperText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
  } as TextStyle,
})
