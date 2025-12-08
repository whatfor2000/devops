import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, TextInput as RNTextInput } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, queryClient } from "@/lib/query-client";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "TaskDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STATUS_OPTIONS = ["todo", "in_progress", "in_review", "completed"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

export default function TaskDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const { data: task, isLoading } = useQuery<any>({
    queryKey: ["/api/tasks", route.params.taskId],
    enabled: !!route.params.taskId,
  });

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/tasks/${route.params.taskId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", route.params.taskId] });
      setIsEditing(false);
      Alert.alert("Success", "Task updated");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${route.params.taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ title, description, status, priority });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading || !task) {
    return (
      <ThemedView style={[styles.container, styles.loading]}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading task...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.projectBadge, { backgroundColor: task.project?.color + "20" }]}>
            <View style={[styles.projectDot, { backgroundColor: task.project?.color }]} />
            <ThemedText type="small" style={{ color: task.project?.color }}>
              {task.project?.name}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <Feather name={isEditing ? "x" : "edit-2"} size={20} color={theme.primary} />
            </Pressable>
            <Pressable onPress={handleDelete}>
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <RNTextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, styles.titleInput, { color: theme.text }]}
              />
            </View>

            <View style={[styles.textAreaContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <RNTextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.optionsSection}>
              <ThemedText type="h4" style={styles.optionLabel}>Status</ThemedText>
              <View style={styles.optionsRow}>
                {STATUS_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setStatus(opt)}
                    style={[
                      styles.optionButton,
                      { backgroundColor: status === opt ? theme.primary : theme.backgroundSecondary },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: status === opt ? "#FFFFFF" : theme.text }}
                    >
                      {opt.replace("_", " ")}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.optionsSection}>
              <ThemedText type="h4" style={styles.optionLabel}>Priority</ThemedText>
              <View style={styles.optionsRow}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setPriority(opt)}
                    style={[
                      styles.optionButton,
                      { backgroundColor: priority === opt ? theme.primary : theme.backgroundSecondary },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: priority === opt ? "#FFFFFF" : theme.text }}
                    >
                      {opt}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <Button
              onPress={handleSave}
              disabled={updateMutation.isPending}
              style={styles.saveButton}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </View>
        ) : (
          <>
            <ThemedText type="h1" style={styles.title}>{task.title}</ThemedText>

            <View style={styles.badges}>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </View>

            {task.description && (
              <View style={styles.descriptionSection}>
                <ThemedText type="h4" style={styles.sectionLabel}>Description</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {task.description}
                </ThemedText>
              </View>
            )}

            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Feather name="user" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Created by {task.creator?.displayName || task.creator?.username}
                </ThemedText>
              </View>
              {task.assignee && (
                <View style={styles.metaRow}>
                  <Feather name="user-check" size={16} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Assigned to {task.assignee.displayName || task.assignee.username}
                  </ThemedText>
                </View>
              )}
              {task.dueDate && (
                <View style={styles.metaRow}>
                  <Feather name="calendar" size={16} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </ThemedText>
                </View>
              )}
            </View>

            {task.attachments && task.attachments.length > 0 && (
              <View style={styles.attachmentsSection}>
                <ThemedText type="h4" style={styles.sectionLabel}>
                  Attachments ({task.attachments.length})
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {task.attachments.map((attachment: any) => (
                    <View
                      key={attachment.id}
                      style={[styles.attachmentCard, { backgroundColor: theme.backgroundDefault }]}
                    >
                      <Feather name="file" size={24} color={theme.primary} />
                      <ThemedText type="caption" numberOfLines={1}>
                        {attachment.filename}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!isEditing && (
        <Pressable
          onPress={() =>
            navigation.navigate("TaskChat", {
              taskId: task.id,
              taskTitle: task.title,
            })
          }
          style={[
            styles.chatButton,
            { backgroundColor: theme.primary, bottom: insets.bottom + Spacing.xl },
          ]}
        >
          <Feather name="message-circle" size={24} color="#FFFFFF" />
          {task.comments && task.comments.length > 0 && (
            <View style={styles.chatBadge}>
              <ThemedText type="caption" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {task.comments.length}
              </ThemedText>
            </View>
          )}
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  descriptionSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  metaSection: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  attachmentsSection: {
    marginBottom: Spacing["2xl"],
  },
  attachmentCard: {
    width: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginRight: Spacing.md,
    gap: Spacing.sm,
  },
  editForm: {
    gap: Spacing.lg,
  },
  inputContainer: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  textAreaContainer: {
    minHeight: 120,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  input: {
    fontSize: Typography.body.fontSize,
  },
  titleInput: {
    fontWeight: "600",
  },
  optionsSection: {
    gap: Spacing.sm,
  },
  optionLabel: {
    marginBottom: Spacing.xs,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  chatButton: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
});
