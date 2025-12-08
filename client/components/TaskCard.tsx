import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  assignee?: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
  _count?: {
    comments: number;
    attachments: number;
  };
}

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  showProject?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({ task, onPress, showProject = true }: TaskCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const isDueSoon = () => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== "completed";
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {showProject && task.project && (
            <View
              style={[
                styles.projectDot,
                { backgroundColor: task.project.color },
              ]}
            />
          )}
          <ThemedText type="h4" numberOfLines={1} style={styles.title}>
            {task.title}
          </ThemedText>
        </View>
        <PriorityBadge priority={task.priority} />
      </View>

      {task.description && (
        <ThemedText
          type="small"
          numberOfLines={2}
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {task.description}
        </ThemedText>
      )}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <StatusBadge status={task.status} />
          {showProject && task.project && (
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {task.project.name}
            </ThemedText>
          )}
        </View>

        <View style={styles.footerRight}>
          {task._count && task._count.comments > 0 && (
            <View style={styles.metaItem}>
              <Feather name="message-circle" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {task._count.comments}
              </ThemedText>
            </View>
          )}
          {task._count && task._count.attachments > 0 && (
            <View style={styles.metaItem}>
              <Feather name="paperclip" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {task._count.attachments}
              </ThemedText>
            </View>
          )}
          {task.assignee && (
            <Avatar
              name={task.assignee.displayName || task.assignee.username}
              url={task.assignee.avatarUrl}
              size={24}
            />
          )}
        </View>
      </View>

      {task.dueDate && (
        <View style={styles.dueRow}>
          <Feather
            name="calendar"
            size={14}
            color={isOverdue() ? theme.error : isDueSoon() ? theme.warning : theme.textSecondary}
          />
          <ThemedText
            type="caption"
            style={{
              color: isOverdue() ? theme.error : isDueSoon() ? theme.warning : theme.textSecondary,
            }}
          >
            {isOverdue() ? "Overdue: " : isDueSoon() ? "Due today: " : "Due: "}
            {new Date(task.dueDate).toLocaleDateString()}
          </ThemedText>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  description: {
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
