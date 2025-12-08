import React from "react";
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProjects(), refetchTasks()]);
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const tasksDueToday = tasks?.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  }) || [];

  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress") || [];
  const completedThisWeek = tasks?.filter((t) => {
    if (t.status !== "completed") return false;
    const updated = new Date(t.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated >= weekAgo;
  }) || [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["2xl"], paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {greeting()}
            </ThemedText>
            <ThemedText type="h2">{user?.displayName || user?.username}</ThemedText>
          </View>
          <Avatar
            name={user?.displayName || user?.username || "U"}
            url={user?.avatarUrl}
            size={48}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h2" style={{ color: theme.warning }}>
              {tasksDueToday.length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Due Today
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {inProgressTasks.length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              In Progress
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h2" style={{ color: theme.success }}>
              {completedThisWeek.length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Completed
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Projects</ThemedText>
            <Pressable onPress={() => navigation.navigate("CreateModal")}>
              <Feather name="plus" size={22} color={theme.primary} />
            </Pressable>
          </View>

          {projectsLoading ? (
            <Card>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Loading projects...
              </ThemedText>
            </Card>
          ) : projects && projects.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectsScroll}>
              {projects.map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() => navigation.navigate("ProjectDetail", { projectId: project.id })}
                >
                  <View style={[styles.projectCard, { backgroundColor: theme.backgroundDefault }]}>
                    <View style={[styles.projectColor, { backgroundColor: project.color }]} />
                    <ThemedText type="h4" numberOfLines={1}>{project.name}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {project._count?.tasks || 0} tasks
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Card onPress={() => navigation.navigate("CreateModal")}>
              <View style={styles.emptyState}>
                <Feather name="folder-plus" size={32} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                  Create your first project
                </ThemedText>
              </View>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Recent Tasks</ThemedText>
          </View>

          {tasksLoading ? (
            <Card>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Loading tasks...
              </ThemedText>
            </Card>
          ) : tasks && tasks.length > 0 ? (
            <View style={styles.tasksList}>
              {tasks.slice(0, 5).map((task) => (
                <Card
                  key={task.id}
                  onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })}
                  style={styles.taskCard}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleRow}>
                      <View
                        style={[
                          styles.projectDot,
                          { backgroundColor: task.project?.color || theme.primary },
                        ]}
                      />
                      <ThemedText type="h4" numberOfLines={1} style={styles.taskTitle}>
                        {task.title}
                      </ThemedText>
                    </View>
                    <StatusBadge status={task.status} />
                  </View>
                  <View style={styles.taskMeta}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {task.project?.name}
                    </ThemedText>
                    {task.dueDate && (
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </ThemedText>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card onPress={() => navigation.navigate("CreateModal")}>
              <View style={styles.emptyState}>
                <Feather name="clipboard" size={32} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                  No tasks yet. Create one!
                </ThemedText>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  headerLeft: {
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  projectsScroll: {
    marginHorizontal: -Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  projectCard: {
    width: 160,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    gap: Spacing.xs,
  },
  projectColor: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  tasksList: {
    gap: Spacing.md,
  },
  taskCard: {
    padding: Spacing.lg,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.md,
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  taskTitle: {
    flex: 1,
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
});
