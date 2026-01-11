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
} from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"
import { validateEmail, validatePassword } from "@/utils/validators"

export const LoginForm = () => {
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {}

    if (!email || !validateEmail(email)) {
      errors.email = "Please enter a valid email"
    }

    if (!password || !validatePassword(password)) {
      errors.password = "Password must be at least 6 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return

    try {
      await login(email, password)
    } catch (err: any) {
      Alert.alert("Login Error", err.message || "Failed to login")
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text style={styles.title}>Spotix Booker</Text>
        <Text style={styles.subtitle}>Event Access Control</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, validationErrors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.mutedForeground}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>

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
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
            {validationErrors.password && (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            )}
          </View>

          {error && <Text style={styles.apiError}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

// ======= STYLES =======

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  } as ViewStyle,

  content: {
    alignItems: "center",
  } as ViewStyle,

  title: {
    ...(TYPOGRAPHY.heading1 as TextStyle),
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  } as TextStyle,

  subtitle: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xxl,
    textAlign: "center",
  } as TextStyle,

  form: {
    width: "100%",
    maxWidth: 400,
  } as ViewStyle,

  inputGroup: {
    marginBottom: SPACING.lg,
  } as ViewStyle,

  label: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.sm,
  } as TextStyle,

  input: {
    ...(TYPOGRAPHY.body as TextStyle),
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    color: COLORS.foreground,
  } as TextStyle,

  inputError: {
    borderColor: COLORS.error,
  } as TextStyle,

  errorText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.error,
    marginTop: SPACING.xs,
  } as TextStyle,

  apiError: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.error,
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  } as TextStyle,

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  buttonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  buttonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.white,
  } as TextStyle,
})
