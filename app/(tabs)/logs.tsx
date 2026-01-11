import { View, StyleSheet } from "react-native"
import { LogsScreen } from "@/components/LogsScreen"

export default function Logs() {
  return (
    <View style={styles.container}>
      <LogsScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
