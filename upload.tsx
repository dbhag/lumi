// app/upload.tsx
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    analyzeRecap,
    AnalyzeRecapResult,
    Slide as RecapSlide,
} from "../lib/analyzeRecap";

type Slide = RecapSlide;

export default function UploadPhotosScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImages = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to make a recap."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled) return;

    const newSlides: Slide[] = result.assets.map((asset) => ({
      uri: asset.uri,
    }));

    setSlides((prev) => [...prev, ...newSlides]);
  };

  const handleContinue = async () => {
    if (slides.length === 0) {
      Alert.alert(
        "Add at least one photo",
        "You need at least one photo to create a recap."
      );
      return;
    }

    try {
      setIsLoading(true);

      const analysis: AnalyzeRecapResult = await analyzeRecap({
        slides,
        caption,
      });

      // Prefer AI-ordered slides for storytelling, but fall back safely
      const orderedSlides =
        (analysis.orderedSlides && analysis.orderedSlides.length > 0
          ? analysis.orderedSlides
          : slides) as Slide[];

      router.push({
        pathname: "/slideshow",
        params: {
          slides: JSON.stringify(orderedSlides),
          caption,
          title: analysis.title,
          vibeKey: analysis.vibeKey,
          vibeLabel: analysis.vibeLabel,
          description: analysis.description,
          highlights: JSON.stringify(analysis.highlights ?? []),
        },
      } as any);
    } catch (e) {
      console.error("Error analyzing recap:", e);
      Alert.alert(
        "Error",
        "Something went wrong while generating your recap vibe."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = slides.length === 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Make a Recap",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#F9FAFB",
          headerBackTitle: "",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#020617" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.container}>
          {/* Tap ANYWHERE in this ScrollView to dismiss keyboard */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onTouchStart={() => Keyboard.dismiss()}
          >
            <Text style={styles.label}>What’s this recap about?</Text>
            <TextInput
              style={styles.input}
              placeholder="Weekend in Chicago, finals week, girls trip..."
              placeholderTextColor="#6B7280"
              value={caption}
              onChangeText={setCaption}
              multiline
            />

            <View style={styles.photosHeader}>
              <Text style={styles.label}>Photos</Text>
              <Text style={styles.subtext}>
                Add your favorite moments from this week, month, or trip.
              </Text>
            </View>

            {isEmpty ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No photos yet</Text>
                <Text style={styles.emptyText}>
                  Tap below to pick photos from your camera roll.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbScroll}
                contentContainerStyle={styles.thumbRow}
              >
                {slides.map((slide, idx) => (
                  <View key={slide.uri + idx} style={styles.thumbWrapper}>
                    <Image
                      source={{ uri: slide.uri }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={pickImages}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>
                {isEmpty ? "Add photos" : "Add more photos"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (isEmpty || isLoading) && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={isEmpty || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text style={styles.continueText}>Continue</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.footerHint}>
                Lumi will read the vibe of your recap and generate a title,
                mood, and description.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#F9FAFB",
    fontSize: 24,
    fontWeight: "400",
  },
  label: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#F9FAFB",
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  photosHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  subtext: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
  },
  thumbScroll: {
    maxHeight: 120,
    marginBottom: 16,
  },
  thumbRow: {
    paddingLeft: 4,
    paddingRight: 16,
    alignItems: "center",
  },
  thumbWrapper: {
    width: 90,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    backgroundColor: "#111827",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4C1D95",
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#020617",
  },
  addButtonText: {
    color: "#C4B5FD",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
  },
  continueButton: {
    backgroundColor: "#A855F7",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "600",
  },
  footerHint: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
});
