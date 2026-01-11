import { View, StyleSheet } from "react-native"
import { RegistryScreen } from "@/components/RegistryScreen"

export default function Registry() {
  return (
    <View style={styles.container}>
      <RegistryScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
