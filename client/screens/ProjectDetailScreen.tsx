import React from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { TaskCard } from "@/components/TaskCard";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, queryClient } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "ProjectDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProjectDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = React.useState(false);

  const { data: project, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/projects", route.params.projectId],
    enabled: !!route.params.projectId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/projects/${route.params.projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project and all its tasks?",
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

  if (isLoading || !project) {
    return (
      <ThemedView style={[styles.container, styles.loading]}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading project...
        </ThemedText>
      </ThemedView>
    );
  }

  const tasksByStatus = {
    todo: project.tasks?.filter((t: any) => t.status === "todo") || [],
    in_progress: project.tasks?.filter((t: any) => t.status === "in_progress") || [],
    in_review: project.tasks?.filter((t: any) => t.status === "in_review") || [],
    completed: project.tasks?.filter((t: any) => t.status === "completed") || [],
  };

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = tasksByStatus.completed.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const renderTask = ({ item }: { item: any }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
      showProject={false}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={project.tasks || []}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={[styles.colorBar, { backgroundColor: project.color }]} />
                <Pressable onPress={handleDelete}>
                  <Feather name="trash-2" size={20} color={theme.error} />
                </Pressable>
              </View>
              <ThemedText type="h1">{project.name}</ThemedText>
              {project.description && (
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {project.description}
                </ThemedText>
              )}
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Progress
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {completedTasks} / {totalTasks} tasks
                </ThemedText>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.success, width: `${progress}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="h3" style={{ color: theme.statusToDo }}>
                  {tasksByStatus.todo.length}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  To Do
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="h3" style={{ color: theme.warning }}>
                  {tasksByStatus.in_progress.length}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  In Progress
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="h3" style={{ color: theme.purple }}>
                  {tasksByStatus.in_review.length}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  In Review
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="h3" style={{ color: theme.success }}>
                  {tasksByStatus.completed.length}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Done
                </ThemedText>
              </View>
            </View>

            <View style={styles.membersSection}>
              <ThemedText type="h4" style={styles.sectionLabel}>
                Team ({project.members?.length || 0})
              </ThemedText>
              <View style={styles.membersRow}>
                {project.members?.map((member: any) => (
                  <Avatar
                    key={member.id}
                    name={member.user?.displayName || member.user?.username}
                    url={member.user?.avatarUrl}
                    size={40}
                  />
                ))}
              </View>
            </View>

            <ThemedText type="h4" style={styles.sectionLabel}>
              Tasks ({totalTasks})
            </ThemedText>
          </>
        }
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyState}>
              <Feather name="clipboard" size={32} color={theme.textSecondary} />
              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, marginTop: Spacing.md }}
              >
                No tasks in this project yet
              </ThemedText>
              <Pressable
                onPress={() => navigation.navigate("CreateModal")}
                style={[styles.createButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                  Create Task
                </ThemedText>
              </Pressable>
            </View>
          </Card>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
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
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing["2xl"],
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  colorBar: {
    width: 48,
    height: 6,
    borderRadius: 3,
  },
  progressSection: {
    marginBottom: Spacing["2xl"],
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  membersSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  membersRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  createButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
