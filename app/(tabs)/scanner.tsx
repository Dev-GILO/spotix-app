import { View, StyleSheet } from "react-native"
import { ScannerScreen } from "@/components/ScannerScreen"

export default function Scanner() {
  return (
    <View style={styles.container}>
      <ScannerScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
