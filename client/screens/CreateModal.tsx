import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, TextInput as RNTextInput, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, queryClient } from "@/lib/query-client";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type CreateMode = "select" | "project" | "task";

const PROJECT_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const STATUS_OPTIONS = ["todo", "in_progress", "in_review"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

export default function CreateModal() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<CreateMode>("select");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [taskPriority, setTaskPriority] = useState("medium");

  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; color: string }) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      Alert.alert("Error", "Project name is required");
      return;
    }
    createProjectMutation.mutate({
      name: projectName.trim(),
      description: projectDescription.trim(),
      color: projectColor,
    });
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }
    if (!taskProjectId) {
      Alert.alert("Error", "Please select a project");
      return;
    }
    createTaskMutation.mutate({
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      projectId: taskProjectId,
      status: taskStatus,
      priority: taskPriority,
    });
  };

  if (mode === "select") {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <ThemedText type="h2" style={styles.title}>
            What would you like to create?
          </ThemedText>

          <Card
            onPress={() => setMode("project")}
            style={styles.optionCard}
          >
            <View style={[styles.optionIcon, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="folder-plus" size={28} color={theme.primary} />
            </View>
            <View style={styles.optionContent}>
              <ThemedText type="h3">New Project</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Create a project to organize your tasks
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </Card>

          <Card
            onPress={() => {
              if (!projects || projects.length === 0) {
                Alert.alert("No Projects", "Create a project first before adding tasks");
                return;
              }
              setTaskProjectId(projects[0].id);
              setMode("task");
            }}
            style={styles.optionCard}
          >
            <View style={[styles.optionIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="check-square" size={28} color={theme.success} />
            </View>
            <View style={styles.optionContent}>
              <ThemedText type="h3">New Task</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Add a task to an existing project
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </Card>
        </View>
      </ThemedView>
    );
  }

  if (mode === "project") {
    return (
      <ThemedView style={styles.container}>
        <KeyboardAwareScrollViewCompat
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          <Pressable onPress={() => setMode("select")} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={theme.primary} />
            <ThemedText type="body" style={{ color: theme.primary }}>
              Back
            </ThemedText>
          </Pressable>

          <ThemedText type="h2" style={styles.formTitle}>
            New Project
          </ThemedText>

          <View style={styles.formField}>
            <ThemedText type="h4" style={styles.fieldLabel}>Name</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <RNTextInput
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Project name"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.formField}>
            <ThemedText type="h4" style={styles.fieldLabel}>Description</ThemedText>
            <View style={[styles.textAreaContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <RNTextInput
                value={projectDescription}
                onChangeText={setProjectDescription}
                placeholder="Optional description"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.formField}>
            <ThemedText type="h4" style={styles.fieldLabel}>Color</ThemedText>
            <View style={styles.colorRow}>
              {PROJECT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setProjectColor(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    projectColor === color && styles.colorOptionSelected,
                  ]}
                >
                  {projectColor === color && (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            onPress={handleCreateProject}
            disabled={createProjectMutation.isPending}
            style={styles.submitButton}
          >
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </KeyboardAwareScrollViewCompat>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Pressable onPress={() => setMode("select")} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary }}>
            Back
          </ThemedText>
        </Pressable>

        <ThemedText type="h2" style={styles.formTitle}>
          New Task
        </ThemedText>

        <View style={styles.formField}>
          <ThemedText type="h4" style={styles.fieldLabel}>Title</ThemedText>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <RNTextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Task title"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
          </View>
        </View>

        <View style={styles.formField}>
          <ThemedText type="h4" style={styles.fieldLabel}>Description</ThemedText>
          <View style={[styles.textAreaContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <RNTextInput
              value={taskDescription}
              onChangeText={setTaskDescription}
              placeholder="Optional description"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.formField}>
          <ThemedText type="h4" style={styles.fieldLabel}>Project</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {projects?.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => setTaskProjectId(project.id)}
                style={[
                  styles.projectOption,
                  { backgroundColor: taskProjectId === project.id ? project.color : theme.backgroundSecondary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: taskProjectId === project.id ? "#FFFFFF" : theme.text }}
                >
                  {project.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formField}>
          <ThemedText type="h4" style={styles.fieldLabel}>Status</ThemedText>
          <View style={styles.optionsRow}>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setTaskStatus(opt)}
                style={[
                  styles.optionButton,
                  { backgroundColor: taskStatus === opt ? theme.primary : theme.backgroundSecondary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: taskStatus === opt ? "#FFFFFF" : theme.text }}
                >
                  {opt.replace("_", " ")}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formField}>
          <ThemedText type="h4" style={styles.fieldLabel}>Priority</ThemedText>
          <View style={styles.optionsRow}>
            {PRIORITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setTaskPriority(opt)}
                style={[
                  styles.optionButton,
                  { backgroundColor: taskPriority === opt ? theme.primary : theme.backgroundSecondary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: taskPriority === opt ? "#FFFFFF" : theme.text }}
                >
                  {opt}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          onPress={handleCreateTask}
          disabled={createTaskMutation.isPending}
          style={styles.submitButton}
        >
          {createTaskMutation.isPending ? "Creating..." : "Create Task"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    marginBottom: Spacing["2xl"],
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  formContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginBottom: Spacing["2xl"],
  },
  formField: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  textAreaContainer: {
    minHeight: 100,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  input: {
    fontSize: Typography.body.fontSize,
  },
  colorRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  projectOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
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
  submitButton: {
    marginTop: Spacing.md,
  },
});
