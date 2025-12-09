import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/lib/auth-context";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthScreen from "@/screens/AuthScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import ProjectDetailScreen from "@/screens/ProjectDetailScreen";
import CreateModal from "@/screens/CreateModal";
import TaskChatScreen from "@/screens/TaskChatScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  ProjectDetail: { projectId: string };
  CreateModal: undefined;
  TaskChat: { taskId: string; taskTitle: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainWithCreate({ navigation }: { navigation: any }) {
  return (
    <MainTabNavigator
      onCreatePress={() => navigation.navigate("CreateModal")}
    />
  );
}

export default function RootStackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.tabIconSelected} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainWithCreate}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{
              ...opaqueScreenOptions,
              headerTitle: "Task Details",
            }}
          />
          <Stack.Screen
            name="ProjectDetail"
            component={ProjectDetailScreen}
            options={{
              ...opaqueScreenOptions,
              headerTitle: "Project",
            }}
          />
          <Stack.Screen
            name="CreateModal"
            component={CreateModal}
            options={{
              presentation: "modal",
              headerTitle: "Create",
            }}
          />
          <Stack.Screen
            name="TaskChat"
            component={TaskChatScreen}
            options={{
              ...opaqueScreenOptions,
              headerTitle: "Chat",
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
