"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "expo-router"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"

export const HomeScreen = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Spotix Booker</Text>
        <Text style={styles.greeting}>Welcome, {user?.name || "User"}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard title="Downloaded Events" value="0" subtitle="Ready to scan" />
        <StatCard title="Pending Sync" value="0" subtitle="Events to sync" />
      </View>

      <View style={styles.statsContainer}>
        <StatCard title="Total Scans" value="0" subtitle="This session" />
        <StatCard title="Server Status" value="Offline" subtitle="Local hub" />
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/registry" as any)}>
          <Text style={styles.actionButtonText}>Download Registry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/scanner" as any)}>
          <Text style={styles.actionButtonText}>Scanner Server</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.actionButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  } as ViewStyle,
  header: {
    marginBottom: SPACING.xxl,
  } as ViewStyle,
  title: {
    ...(TYPOGRAPHY.heading1 as TextStyle),
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  } as TextStyle,
  greeting: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
  } as TextStyle,
  statsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  } as ViewStyle,
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.muted,
  } as ViewStyle,
  statValue: {
    ...(TYPOGRAPHY.heading2 as TextStyle),
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  } as TextStyle,
  statTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  } as TextStyle,
  statSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
  } as TextStyle,
  actionsContainer: {
    marginTop: SPACING.lg,
  } as ViewStyle,
  sectionTitle: {
    ...(TYPOGRAPHY.heading3 as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.md,
  } as TextStyle,
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.md,
    alignItems: "center",
  } as ViewStyle,
  actionButtonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.white,
  } as TextStyle,
  dangerButton: {
    backgroundColor: COLORS.error,
  } as ViewStyle,
})