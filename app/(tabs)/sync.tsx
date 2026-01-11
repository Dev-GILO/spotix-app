import { View, StyleSheet } from "react-native"
import { SyncScreen } from "@/components/SyncScreen"

export default function Sync() {
  return (
    <View style={styles.container}>
      <SyncScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
