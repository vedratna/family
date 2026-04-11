import { View, Pressable, StyleSheet } from "react-native";

import { themes, themeNames, type ThemeName } from "../../../shared/theme";

interface ThemeColorPickerProps {
  selected: ThemeName;
  onSelect: (theme: ThemeName) => void;
}

export function ThemeColorPicker({ selected, onSelect }: ThemeColorPickerProps) {
  return (
    <View style={styles.container}>
      {themeNames.map((name) => {
        const isSelected = name === selected;
        return (
          <Pressable
            key={name}
            style={[
              styles.swatch,
              {
                backgroundColor: themes[name].primary,
                borderWidth: isSelected ? 3 : 0,
                borderColor: isSelected ? "#1A1A1A" : "transparent",
                transform: [{ scale: isSelected ? 1.15 : 1 }],
              },
            ]}
            onPress={() => {
              onSelect(name);
            }}
            testID={`theme-swatch-${name}`}
            accessibilityLabel={`Select ${name} theme`}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
