// app/slideshow.tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Slide = { uri: string };

const SLIDE_DURATION_MS = 2500;

export default function SlideshowScreen() {
  const router = useRouter();
  const {
    slides: slidesParam,
    caption: captionParam,
    title: titleParam,
    vibeKey: vibeKeyParam,
    vibeLabel: vibeLabelParam,
    emotion: emotionParam,
    description: descriptionParam,
    highlights: highlightsParam,
  } = useLocalSearchParams<{
    slides?: string;
    caption?: string;
    title?: string;
    vibeKey?: string;
    vibeLabel?: string;
    emotion?: string;
    description?: string;
    highlights?: string;
  }>();

  const slides: Slide[] = slidesParam ? JSON.parse(String(slidesParam)) : [];
  const caption = captionParam ? String(captionParam) : "";
  const title = titleParam ? String(titleParam) : "";
  const vibeKey = vibeKeyParam ? String(vibeKeyParam) : "default";
  const vibeLabel = vibeLabelParam ? String(vibeLabelParam) : "";
  const emotion = emotionParam ? String(emotionParam) : "default";
  const description = descriptionParam ? String(descriptionParam) : "";
  const highlights: number[] = highlightsParam
    ? JSON.parse(String(highlightsParam))
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // auto-play on open
  const [showIntro, setShowIntro] = useState(true);
  const [showOutro, setShowOutro] = useState(false);

  // Animation values for Ken Burns + fade-in
  const scaleAnim = useRef(new Animated.Value(1.05)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const animateSlideIn = () => {
    scaleAnim.setValue(1.05);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (slides.length === 0) return;
    animateSlideIn();
  }, [currentIndex, slides.length]);

  useEffect(() => {
    if (!isPlaying || slides.length === 0 || showIntro || showOutro) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === slides.length - 1) {
          // stop at end and show outro
          setIsPlaying(false);
          setShowOutro(true);
          return prev;
        }
        return prev + 1;
      });
    }, SLIDE_DURATION_MS);

    return () => clearInterval(id);
  }, [isPlaying, slides.length, showIntro, showOutro]);

  const goNext = () => {
    if (slides.length === 0) return;
    if (currentIndex === slides.length - 1) {
      setIsPlaying(false);
      setShowOutro(true);
      return;
    }
    setShowOutro(false);
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goPrev = () => {
    if (slides.length === 0) return;
    setShowOutro(false);
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const handleShare = async () => {
    if (!slides[currentIndex]) return;
    try {
      await Sharing.shareAsync(slides[currentIndex].uri);
    } catch (e) {
      console.error("Error sharing recap:", e);
    }
  };

  const handleStartRecap = () => {
    if (slides.length === 0) return;
    setShowIntro(false);
    setShowOutro(false);
    setCurrentIndex(0);
    setIsPlaying(true);
    animateSlideIn();
  };

  const handleReplay = () => {
    if (slides.length === 0) return;
    setShowOutro(false);
    setCurrentIndex(0);
    setIsPlaying(true);
    animateSlideIn();
  };

  const isHighlight = highlights.includes(currentIndex);
  const progress =
    slides.length > 0 ? (currentIndex + 1) / slides.length : 0;

  const prettyEmotion =
    emotion && emotion !== "default"
      ? emotion.charAt(0).toUpperCase() + emotion.slice(1)
      : "";

  // Vibe-based accent color
  const vibeAccent = (() => {
    switch (vibeKey) {
      case "hype":
        return "#F97316";
      case "cozy":
        return "#FBBF24";
      case "travel":
        return "#22C55E";
      case "friends":
        return "#EC4899";
      case "chill":
        return "#38BDF8";
      default:
        return "#A855F7";
    }
  })();

  const openingIndex = 0;
  const closingIndex = slides.length > 0 ? slides.length - 1 : 0;
  const midIndex =
    slides.length > 0 ? Math.floor(slides.length / 2) : 0;

  const getSceneType = (index: number): string => {
    if (index === openingIndex) return "Opening scene";
    if (index === closingIndex) return "Closing scene";
    if (index === midIndex) return "Main energy";
    return "Scene";
  };

  if (slides.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Recap",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#020617" },
            headerTintColor: "#F9FAFB",
          }}
        />
        <SafeAreaView style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No slides to show. Go back and add photos.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.back()}
          >
            <Text style={styles.emptyButtonText}>Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  const sceneType = getSceneType(currentIndex);
  const sceneNumberLabel = `Scene ${currentIndex + 1} of ${slides.length}`;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        {/* Header: framed like a mini movie */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {title || "Your Life, As a Movie"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {sceneNumberLabel} • {sceneType}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.playPauseButton, { borderColor: vibeAccent }]}
            onPress={() => {
              if (showIntro) {
                handleStartRecap();
                return;
              }
              if (showOutro) {
                handleReplay();
                return;
              }
              setIsPlaying((prev) => !prev);
            }}
          >
            <Text style={styles.playPauseText}>
              {showIntro
                ? "Start"
                : showOutro
                ? "Replay"
                : isPlaying
                ? "Pause"
                : "Play"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main movie frame with letterbox bars */}
        <View style={styles.slideshowWrapper}>
          {/* Cinemascope bars */}
          <View style={styles.letterboxBarTop} />
          <View style={styles.letterboxBarBottom} />

          <View style={styles.slideshowContainer}>
            {/* top gradient for subtle cinematic feel */}
            <View style={styles.topFadeOverlay} />

            <TouchableOpacity
              style={styles.tapZoneLeft}
              activeOpacity={0.7}
              onPress={goPrev}
            />
            <Animated.Image
              source={{ uri: slides[currentIndex].uri } as ImageSourcePropType}
              style={[
                styles.image,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.tapZoneRight}
              activeOpacity={0.7}
              onPress={goNext}
            />

            {/* bottom overlay text */}
            <View style={styles.overlayBottom}>
              <View style={styles.overlayLeft}>
                <Text style={styles.sceneLabel}>
                  {sceneType}
                  {isHighlight ? " • Highlight" : ""}
                </Text>
                <View style={styles.pillRow}>
                  <Text
                    style={[
                      styles.vibePill,
                      { backgroundColor: `${vibeAccent}E6` },
                    ]}
                  >
                    {vibeLabel || vibeKey}
                  </Text>
                  {prettyEmotion ? (
                    <Text style={styles.emotionPill}>
                      {prettyEmotion}
                    </Text>
                  ) : null}
                </View>
                {description ? (
                  <Text style={styles.description} numberOfLines={2}>
                    {description}
                  </Text>
                ) : (
                  <Text style={styles.description} numberOfLines={2}>
                    Turn your fun life moments into a mini-movie.
                  </Text>
                )}
              </View>
            </View>

            {/* Intro overlay = simple, to-the-point */}
            {showIntro && (
              <View style={styles.fullscreenOverlay}>
                <View style={styles.overlayCard}>
                  <Text style={styles.overlayLabel}>Lumi · Mini-Movie</Text>
                  <Text style={styles.overlayTitle}>
                    We cut your moments into a short movie.
                  </Text>
                  <Text style={styles.overlaySubtitle} numberOfLines={3}>
                    {caption ||
                      "We ordered your best scenes and built a quick recap you can watch like a movie."}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.overlayButton,
                      { backgroundColor: vibeAccent },
                    ]}
                    onPress={handleStartRecap}
                  >
                    <Text style={styles.overlayButtonText}>
                      Play my recap
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.overlayHint}>
                    Auto-advances through your scenes. Tap to move between
                    moments.
                  </Text>
                </View>
              </View>
            )}

            {/* Outro overlay = clean credits */}
            {showOutro && !showIntro && (
              <View style={styles.fullscreenOverlay}>
                <View style={styles.overlayCard}>
                  <Text style={styles.overlayLabel}>Credits</Text>
                  <Text style={styles.overlayTitle}>
                    Directed by you. Cut by Lumi.
                  </Text>
                  <Text style={styles.overlaySubtitle} numberOfLines={3}>
                    {title
                      ? `“${title}” just wrapped.`
                      : "Your mini-movie just finished."}{" "}
                    Watch it again or share your favorite frame.
                  </Text>
                  <View style={styles.overlayActionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.overlayButtonSecondary,
                        { borderColor: vibeAccent },
                      ]}
                      onPress={handleReplay}
                    >
                      <Text
                        style={[
                          styles.overlayButtonSecondaryText,
                          { color: "#F9FAFB" },
                        ]}
                      >
                        Watch again
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.overlayButton,
                        { backgroundColor: vibeAccent },
                      ]}
                      onPress={handleShare}
                    >
                      <Text style={styles.overlayButtonText}>
                        Share moment
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.overlayHint}>
                    Later, you’ll be able to export this as a full video for
                    socials.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: vibeAccent,
              },
            ]}
          />
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: vibeAccent }]}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>
              Share this recap
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerHint}>
            You’re watching a Lumi mini-movie. Video export + soundtracks can
            come later.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: "#E5E7EB",
    fontSize: 18,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  playPauseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#020617",
  },
  playPauseText: {
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: "500",
  },
  slideshowWrapper: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 12,
    position: "relative",
    justifyContent: "center",
  },
  letterboxBarTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#020617",
    zIndex: 5,
  },
  letterboxBarBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#020617",
    zIndex: 5,
  },
  slideshowContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  image: {
    width: "100%",
    height: height * 0.55,
  },
  tapZoneLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "30%",
    zIndex: 3,
  },
  tapZoneRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "30%",
    zIndex: 3,
  },
  overlayBottom: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  overlayLeft: {
    flexShrink: 1,
  },
  sceneLabel: {
    color: "#E5E7EB",
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.9,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  vibePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "600",
  },
  emotionPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15, 118, 110, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    color: "#ECFEFF",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  highlightPill: {
    backgroundColor: "rgba(251, 191, 36, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  highlightText: {
    color: "#78350F",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#111827",
    borderRadius: 999,
    marginHorizontal: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#A855F7",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  shareButton: {
    paddingVertical: 12,
    borderRadius: 999,
  	alignItems: "center",
    marginBottom: 8,
  },
  shareButtonText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "600",
  },
  footerHint: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "#E5E7EB",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#A855F7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "600",
  },
  fullscreenOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 4,
  },
  overlayCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
  },
  overlayLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  overlayTitle: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  overlaySubtitle: {
    color: "#D1D5DB",
    fontSize: 13,
    marginBottom: 14,
  },
  overlayButton: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  overlayButtonText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "600",
  },
  overlayHint: {
    color: "#9CA3AF",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  overlayActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  overlayButtonSecondary: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  overlayButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  topFadeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    zIndex: 1,
  },
});
