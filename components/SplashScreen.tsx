"use client"
import React, { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, TextStyle, ViewStyle, ImageBackground } from "react-native"
import { COLORS, TYPOGRAPHY, SPACING } from "@/theme/colors"

export const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  return (
    <ImageBackground 
      source={require("@/assets/images/hero.jpg")} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Spotix Scanner App</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </Animated.View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay - adjust opacity (0.6) as needed
  } as ViewStyle,
  content: {
    alignItems: "center",
    zIndex: 1, // Ensures content appears above overlay
  } as ViewStyle,
  title: {
    ...(TYPOGRAPHY.heading1 as TextStyle),
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  } as TextStyle,
  subtitle: {
    ...(TYPOGRAPHY.body as TextStyle),
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  } as TextStyle,
})