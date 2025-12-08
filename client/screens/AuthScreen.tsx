import React, { useState } from "react";
import { View, StyleSheet, Alert, Pressable, TextInput as RNTextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !username) {
      Alert.alert("Error", "Username is required for registration");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, username, password, displayName || undefined);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <Feather name="check-circle" size={40} color="#FFFFFF" />
          </View>
          <ThemedText type="h1" style={styles.title}>
            TaskFlow
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isLogin ? "Welcome back! Sign in to continue" : "Create an account to get started"}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <RNTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {!isLogin ? (
            <>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <RNTextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <RNTextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Display name (optional)"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                  autoCapitalize="words"
                />
              </View>
            </>
          ) : null}

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <RNTextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, styles.passwordInput, { color: theme.text }]}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <Button onPress={handleSubmit} disabled={isLoading} style={styles.submitButton}>
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>

          <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <ThemedText type="link" style={{ color: theme.primary }}>
                {isLogin ? "Sign Up" : "Sign In"}
              </ThemedText>
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    height: "100%",
  },
  passwordInput: {
    paddingRight: Spacing.sm,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  switchButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
