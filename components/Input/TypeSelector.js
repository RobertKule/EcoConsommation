import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TypeSelector({ value, onValueChange, options }) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionButton,
            value === option.value && styles.optionButtonActive,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              value === option.value && styles.optionTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  optionButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    width: "45%",
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#fff",
  },
});