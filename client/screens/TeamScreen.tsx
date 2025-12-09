import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl, Alert, TextInput as RNTextInput } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/query-client";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function TeamScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: team, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/team"],
  });

  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ projectId, email }: { projectId: string; email: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/members`, { email });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowInvite(false);
      setInviteEmail("");
      Alert.alert("Success", "Team member invited successfully");
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

  const handleInvite = () => {
    if (!inviteEmail) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (!projects || projects.length === 0) {
      Alert.alert("Error", "Create a project first to invite team members");
      return;
    }

    inviteMutation.mutate({ projectId: projects[0].id, email: inviteEmail });
  };

  const renderMember = ({ item }: { item: any }) => (
    <Card style={styles.memberCard}>
      <View style={styles.memberRow}>
        <Avatar
          name={item.displayName || item.username}
          url={item.avatarUrl}
          size={48}
        />
        <View style={styles.memberInfo}>
          <ThemedText type="h4">
            {item.displayName || item.username}
            {item.id === user?.id && (
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {" "}(You)
              </ThemedText>
            )}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {item.email}
          </ThemedText>
        </View>
        <View style={styles.taskCount}>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {item._count?.assignedTasks || 0}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            tasks
          </ThemedText>
        </View>
      </View>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText type="h1">Team</ThemedText>
        <Pressable onPress={() => setShowInvite(!showInvite)}>
          <Feather name={showInvite ? "x" : "user-plus"} size={24} color={theme.primary} />
        </Pressable>
      </View>

      {showInvite && (
        <View style={[styles.inviteContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <RNTextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email to invite"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Pressable
            onPress={handleInvite}
            disabled={inviteMutation.isPending}
            style={[styles.inviteButton, { backgroundColor: theme.primary, opacity: inviteMutation.isPending ? 0.5 : 1 }]}
          >
            <ThemedText type="body" style={{ color: "#FFFFFF" }}>
              {inviteMutation.isPending ? "Inviting..." : "Invite"}
            </ThemedText>
          </Pressable>
        </View>
      )}

      <FlatList
        data={team}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Loading team...
              </ThemedText>
            ) : (
              <>
                <Feather name="users" size={48} color={theme.textSecondary} />
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.lg, textAlign: "center" }}
                >
                  Your team members will appear here.{"\n"}Invite someone to collaborate!
                </ThemedText>
              </>
            )}
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  inviteContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  input: {
    fontSize: Typography.body.fontSize,
  },
  inviteButton: {
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  memberCard: {
    padding: Spacing.lg,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  memberInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  taskCount: {
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
});
