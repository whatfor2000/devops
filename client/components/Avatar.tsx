import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

interface AvatarProps {
  name?: string;
  url?: string | null;
  size?: number;
}

const AVATAR_COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name = "U", url, size = 40 }: AvatarProps) {
  const { theme } = useTheme();
  const backgroundColor = getColorFromName(name);
  const initials = getInitials(name);
  const fontSize = size * 0.4;

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <ThemedText
        style={[styles.initials, { fontSize, color: "#FFFFFF" }]}
      >
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    backgroundColor: "#E2E8F0",
  },
  initials: {
    fontWeight: "600",
  },
});
