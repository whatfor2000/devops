import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput as RNTextInput,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, apiRequestFormData, queryClient } from "@/lib/query-client";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "TaskChat">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TaskChatScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [message, setMessage] = useState("");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: route.params.taskTitle,
    });
  }, [navigation, route.params.taskTitle]);

  const { data: task, isLoading } = useQuery<any>({
    queryKey: ["/api/tasks", route.params.taskId],
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/tasks/${route.params.taskId}/comments`, {
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", route.params.taskId] });
      setMessage("");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "file";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("file", blob, filename);
      } else {
        formData.append("file", {
          uri,
          name: filename,
          type,
        } as any);
      }

      const res = await apiRequestFormData(
        "POST",
        `/api/tasks/${route.params.taskId}/attachments`,
        formData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", route.params.taskId] });
      Alert.alert("Success", "File uploaded");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const handleAttach = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadMutation.mutate(result.assets[0].uri);
    }
  };

  const comments = task?.comments || [];

  const renderComment = ({ item }: { item: any }) => {
    const isOwnMessage = item.userId === user?.id;

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage && styles.messageRowOwn,
        ]}
      >
        {!isOwnMessage && (
          <Avatar
            name={item.user?.displayName || item.user?.username}
            url={item.user?.avatarUrl}
            size={32}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage ? theme.primary : theme.backgroundSecondary,
            },
          ]}
        >
          {!isOwnMessage && (
            <ThemedText type="caption" style={styles.messageSender}>
              {item.user?.displayName || item.user?.username}
            </ThemedText>
          )}
          <ThemedText
            type="body"
            style={{ color: isOwnMessage ? "#FFFFFF" : theme.text }}
          >
            {item.content}
          </ThemedText>
          <ThemedText
            type="caption"
            style={{
              color: isOwnMessage ? "rgba(255,255,255,0.7)" : theme.textSecondary,
              alignSelf: "flex-end",
              marginTop: Spacing.xs,
            }}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Loading messages...
              </ThemedText>
            ) : (
              <>
                <Feather name="message-circle" size={48} color={theme.textSecondary} />
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.lg }}
                >
                  No messages yet. Start the conversation!
                </ThemedText>
              </>
            )}
          </View>
        }
      />

      <View
        style={[
          styles.inputArea,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.md,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Pressable onPress={handleAttach} style={styles.attachButton}>
          <Feather
            name="paperclip"
            size={22}
            color={uploadMutation.isPending ? theme.textSecondary : theme.primary}
          />
        </Pressable>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <RNTextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            multiline
            maxLength={1000}
          />
        </View>
        <Pressable
          onPress={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          style={[
            styles.sendButton,
            {
              backgroundColor:
                message.trim() && !sendMutation.isPending
                  ? theme.primary
                  : theme.backgroundSecondary,
            },
          ]}
        >
          <Feather
            name="send"
            size={20}
            color={message.trim() && !sendMutation.isPending ? "#FFFFFF" : theme.textSecondary}
          />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  messageSender: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  attachButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    maxHeight: 120,
  },
  input: {
    fontSize: Typography.body.fontSize,
    minHeight: 28,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
