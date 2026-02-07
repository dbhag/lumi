// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/upload" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>✨</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Lumi</Text>
        <Text style={styles.subtitle}>Create beautiful photo recaps in seconds</Text>

        {/* Primary CTA */}
        <TouchableOpacity style={styles.primaryButton} onPress={handlePress}>
          <Text style={styles.primaryButtonText}>Make a Recap</Text>
        </TouchableOpacity>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050816",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
  },
  iconText: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 40,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dotsRow: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1F2933",
  },
  dotActive: {
    backgroundColor: "#8B5CF6",
  },
});
