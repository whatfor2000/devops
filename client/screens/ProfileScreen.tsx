import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, TextInput as RNTextInput } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { displayName: string }) => {
      const res = await apiRequest("PUT", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: (data) => {
      updateUser({ displayName: data.displayName });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ displayName });
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["2xl"], paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="h1">Profile</ThemedText>
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Feather
              name={isEditing ? "x" : "edit-2"}
              size={22}
              color={theme.primary}
            />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <Avatar
            name={user?.displayName || user?.username || "U"}
            url={user?.avatarUrl}
            size={100}
          />
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <RNTextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Display name"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                  autoCapitalize="words"
                />
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
              <ThemedText type="h2" style={styles.name}>
                {user?.displayName || user?.username}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                @{user?.username}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {user?.email}
              </ThemedText>
            </>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Account
          </ThemedText>

          <Card style={styles.menuCard}>
            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Feather name="bell" size={20} color={theme.text} />
                <ThemedText type="body">Notifications</ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          </Card>

          <Card style={styles.menuCard}>
            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Feather name="moon" size={20} color={theme.text} />
                <ThemedText type="body">Appearance</ThemedText>
              </View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                System
              </ThemedText>
            </Pressable>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            About
          </ThemedText>

          <Card style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Feather name="info" size={20} color={theme.text} />
                <ThemedText type="body">Version</ThemedText>
              </View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                1.0.0
              </ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="log-out" size={20} color={theme.error} />
            <ThemedText type="body" style={{ color: theme.error }}>
              Log Out
            </ThemedText>
          </Pressable>
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
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
    gap: Spacing.sm,
  },
  name: {
    marginTop: Spacing.lg,
  },
  editForm: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  inputContainer: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  input: {
    fontSize: Typography.body.fontSize,
  },
  saveButton: {
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  menuCard: {
    padding: 0,
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
