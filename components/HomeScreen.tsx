"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  ViewStyle, 
  TextStyle 
} from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "expo-router"
import { getRealm } from "@/database/realm"
import { COLORS, SPACING, TYPOGRAPHY } from "@/theme/colors"

interface Stats {
  downloadedEvents: number
  totalTickets: number
  scannedTickets: number
  pendingSync: number
  verifiedToday: number
}

export const HomeScreen = () => {
  const { user, isInitializing, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats>({
    downloadedEvents: 0,
    totalTickets: 0,
    scannedTickets: 0,
    pendingSync: 0,
    verifiedToday: 0,
  })
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Wait for Realm to be initialized
    if (!isInitializing) {
      loadStats()
      checkServerStatus()

      // Refresh stats every 10 seconds
      const interval = setInterval(() => {
        loadStats()
        checkServerStatus()
      }, 10000)

      return () => {
        clearInterval(interval)
        console.log("[HomeScreen] Cleaning up interval")
      }
    }
  }, [isInitializing])

  const loadStats = () => {
    try {
      const realm = getRealm()

      // Get downloaded events count
      const events = realm.objects("Event")
      const downloadedEvents = events.filtered("downloadedAt != null").length

      // Get total tickets
      const tickets = realm.objects("Ticket")
      const totalTickets = tickets.length

      // Get scanned/verified tickets
      const scannedTickets = tickets.filtered("verified == true").length

      // Get pending sync (offline scans not synced)
      const pendingSync = tickets.filtered("scannedOffline == true AND syncedToServer == false").length

      // Get verified today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]
      
      const verifiedToday = tickets.filtered(
        "verified == true AND verificationDate CONTAINS $0", 
        todayStr
      ).length

      setStats({
        downloadedEvents,
        totalTickets,
        scannedTickets,
        pendingSync,
        verifiedToday,
      })

      console.log("[HomeScreen] Stats loaded:", {
        downloadedEvents,
        totalTickets,
        scannedTickets,
        pendingSync,
        verifiedToday,
      })
    } catch (error) {
      console.error("[HomeScreen] Error loading stats:", error)
    }
  }

  const checkServerStatus = async () => {
    try {
      // Simple connectivity check - try a basic fetch with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      // Try to reach the backend API base URL
      const response = await fetch('http://localhost:3000', {
        method: 'HEAD',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      setIsOnline(response.ok || response.status < 500)
    } catch (error) {
      // Network error or timeout - mark as offline
      setIsOnline(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await checkServerStatus()
      loadStats()
    } catch (error) {
      console.error("[HomeScreen] Refresh error:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (err) {
      console.error("[HomeScreen] Logout error:", err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Show loading while Realm initializes
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.fullName || user?.username || "User"}</Text>
          {user?.isBooker && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Verified Booker</Text>
            </View>
          )}
        </View>
        
        {/* Server Status Indicator */}
        <View style={[styles.statusIndicator, isOnline ? styles.statusOnline : styles.statusOffline]}>
          <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
          <Text style={styles.statusText}>{isOnline ? "Online" : "Offline"}</Text>
        </View>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard 
          title="Events" 
          value={stats.downloadedEvents.toString()} 
          subtitle="Downloaded"
          icon="📅"
          color={COLORS.primary}
        />
        <StatCard 
          title="Tickets" 
          value={stats.totalTickets.toString()} 
          subtitle="Total available"
          icon="🎫"
          color={COLORS.info}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Verified" 
          value={stats.scannedTickets.toString()} 
          subtitle="All time"
          icon="✓"
          color={COLORS.success}
        />
        <StatCard 
          title="Today" 
          value={stats.verifiedToday.toString()} 
          subtitle="Verified today"
          icon="🕒"
          color={COLORS.warning}
        />
      </View>

      {/* Pending Sync Alert */}
      {stats.pendingSync > 0 && (
        <View style={styles.syncAlert}>
          <Text style={styles.syncAlertIcon}>⚠️</Text>
          <View style={styles.syncAlertContent}>
            <Text style={styles.syncAlertTitle}>Pending Sync</Text>
            <Text style={styles.syncAlertText}>
              {stats.pendingSync} offline {stats.pendingSync === 1 ? 'scan' : 'scans'} waiting to sync
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => router.push("/registry" as any)}
        >
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonIcon}>📥</Text>
            <View style={styles.actionButtonTextContainer}>
              <Text style={styles.actionButtonText}>Download Registry</Text>
              <Text style={styles.actionButtonSubtext}>
                Get event attendees for offline scanning
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => router.push("/scanner" as any)}
        >
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonIcon}>📱</Text>
            <View style={styles.actionButtonTextContainer}>
              <Text style={styles.actionButtonText}>Scanner Hub</Text>
              <Text style={styles.actionButtonSubtext}>
                Start scanning tickets
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {stats.pendingSync > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.syncButton]} 
            onPress={() => {/* TODO: Implement sync */}}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🔄</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonText}>Sync Now</Text>
                <Text style={styles.actionButtonSubtext}>
                  Upload {stats.pendingSync} pending {stats.pendingSync === 1 ? 'scan' : 'scans'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🚪</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonText}>Sign Out</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pull down to refresh • Last updated: {new Date().toLocaleTimeString()}
        </Text>
        {user?.email && (
          <Text style={styles.footerEmail}>{user.email}</Text>
        )}
      </View>
    </ScrollView>
  )
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  color 
}: { 
  title: string
  value: string
  subtitle: string
  icon: string
  color: string
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </View>
)

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  } as ViewStyle,
  loadingText: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  } as TextStyle,
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
  } as ViewStyle,
  header: {
    marginBottom: SPACING.xl,
  } as ViewStyle,
  headerContent: {
    marginBottom: SPACING.md,
  } as ViewStyle,
  greeting: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: COLORS.mutedForeground,
    fontSize: 16,
  } as TextStyle,
  userName: {
    ...(TYPOGRAPHY.heading1 as TextStyle),
    color: COLORS.foreground,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: SPACING.xs,
  } as TextStyle,
  badge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: SPACING.sm,
  } as ViewStyle,
  badgeText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 12,
  } as TextStyle,
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: "flex-start",
  } as ViewStyle,
  statusOnline: {
    backgroundColor: COLORS.success + '15',
  } as ViewStyle,
  statusOffline: {
    backgroundColor: COLORS.error + '15',
  } as ViewStyle,
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  } as ViewStyle,
  dotOnline: {
    backgroundColor: COLORS.success,
  } as ViewStyle,
  dotOffline: {
    backgroundColor: COLORS.error,
  } as ViewStyle,
  statusText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    fontWeight: "600",
    fontSize: 12,
  } as TextStyle,
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  } as ViewStyle,
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.muted,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  } as ViewStyle,
  statIcon: {
    fontSize: 20,
  } as TextStyle,
  statValue: {
    ...(TYPOGRAPHY.heading2 as TextStyle),
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  } as TextStyle,
  statTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
    fontSize: 13,
    fontWeight: "600",
  } as TextStyle,
  statSubtitle: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
    fontSize: 11,
  } as TextStyle,
  syncAlert: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  } as ViewStyle,
  syncAlertIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  } as TextStyle,
  syncAlertContent: {
    flex: 1,
  } as ViewStyle,
  syncAlertTitle: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.warning,
    fontWeight: "bold",
    marginBottom: 2,
  } as TextStyle,
  syncAlertText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.foreground,
  } as TextStyle,
  actionsContainer: {
    marginTop: SPACING.lg,
  } as ViewStyle,
  sectionTitle: {
    ...(TYPOGRAPHY.heading3 as TextStyle),
    color: COLORS.foreground,
    marginBottom: SPACING.md,
    fontSize: 18,
    fontWeight: "bold",
  } as TextStyle,
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.muted,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  } as ViewStyle,
  actionButtonIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  } as TextStyle,
  actionButtonTextContainer: {
    flex: 1,
  } as ViewStyle,
  actionButtonText: {
    ...(TYPOGRAPHY.label as TextStyle),
    color: COLORS.foreground,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  } as TextStyle,
  actionButtonSubtext: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    fontSize: 12,
  } as TextStyle,
  syncButton: {
    backgroundColor: COLORS.warning + '10',
    borderColor: COLORS.warning + '30',
  } as ViewStyle,
  dangerButton: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error + '30',
  } as ViewStyle,
  footer: {
    marginTop: SPACING.xl,
    alignItems: "center",
  } as ViewStyle,
  footerText: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    textAlign: "center",
    fontSize: 11,
  } as TextStyle,
  footerEmail: {
    ...(TYPOGRAPHY.caption as TextStyle),
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
    fontSize: 11,
  } as TextStyle,
})