import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { PriorityColors, Spacing, BorderRadius } from "@/constants/theme";

interface PriorityBadgeProps {
  priority: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_ICONS: Record<string, string> = {
  high: "arrow-up",
  medium: "minus",
  low: "arrow-down",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = PriorityColors[priority as keyof typeof PriorityColors] || PriorityColors.medium;
  const label = PRIORITY_LABELS[priority] || priority;
  const iconName = PRIORITY_ICONS[priority] || "minus";

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Feather name={iconName as any} size={12} color={colors.text} />
      <ThemedText type="caption" style={[styles.text, { color: colors.text }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  text: {
    fontWeight: "500",
  },
});
