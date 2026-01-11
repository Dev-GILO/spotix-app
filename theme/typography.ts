import { TextStyle } from "react-native"

export const TYPOGRAPHY: {
  heading1: TextStyle
  heading2: TextStyle
  body: TextStyle
  label: TextStyle
  caption: TextStyle
} = {
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },

  heading2: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },

  body: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
  },

  caption: {
    fontSize: 12,
    fontWeight: "500",
  },
}
