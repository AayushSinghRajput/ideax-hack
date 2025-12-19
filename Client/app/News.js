import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/languageSlice";
import { toggleSpeaking, stopSpeaking } from "../services/ttsService";
import { fetchAgriNews } from "../services/newsService";
import {
  cleanNewsDescription,
  formatNewsDescription,
} from "../utils/newsFormatter";

// Enable animation for Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function NewsScreen() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.value);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [speakingNewsId, setSpeakingNewsId] = useState(null);

  const translateText = (en, np) => (language === "EN" ? en : np);

  const handleLanguageToggle = () => {
    dispatch(setLanguage(language === "EN" ? "NP" : "EN"));
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePlayButton = (item) => {
    const textToSpeak = `${item.title}. ${item.description}`;
    const isSpeaking = toggleSpeaking(textToSpeak, language);
    setSpeakingNewsId(isSpeaking ? item.id : null);
  };

  /** 🔹 Load news from backend */
  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchAgriNews(language);
      setNews(data);
    } catch (error) {
      console.log("❌ Error loading news");
    } finally {
      setLoading(false);
    }
  };

  /** Reload when language changes */
  useEffect(() => {
    stopSpeaking();
    setSpeakingNewsId(null);
    loadNews();
  }, [language]);

  /** Cleanup TTS */
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const renderNewsCard = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const isPlaying = speakingNewsId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="newspaper-outline" size={22} color="#4CAF50" />
          <Text style={styles.title}>{item.title}</Text>

          <TouchableOpacity onPress={() => handlePlayButton(item)}>
            <Ionicons
              name={isPlaying ? "pause-circle-outline" : "play-circle-outline"}
              size={26}
              color="#4CAF50"
            />
          </TouchableOpacity>
        </View>

        {(() => {
          const { highlight, body } = formatNewsDescription(item.description);

          return (
            <View>
              <Text style={styles.highlightText}>{highlight}</Text>

              {body ? (
                <Text
                  style={styles.description}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {body}
                </Text>
              ) : null}
            </View>
          );
        })()}

        <View style={styles.footer}>
          <Text style={styles.source}>{item.source}</Text>

          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color="#777" />
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>

        <Text style={styles.readMore}>
          {isExpanded
            ? translateText("Show Less ▲", "कम देखाउनुहोस् ▲")
            : translateText("Read More ▼", "थप पढ्नुहोस् ▼")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="leaf" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>
            {translateText(
              "Agriculture & Veterinary News",
              "कृषि तथा पशुपन्छी समाचार"
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLanguageToggle}
          style={styles.languageButton}
        >
          <Ionicons name="language-outline" size={16} color="#FFFFFF" />
          <Text style={styles.languageText}>{language}</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderNewsCard}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4CAF50",
  },

  header: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },

  languageText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  listContent: {
    padding: 16,
    backgroundColor: "#F6F8FA",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginVertical: 8,
  },

  footer: {
    marginTop: 8,
  },

  source: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  date: {
    fontSize: 12,
    color: "#777",
  },

  readMore: {
    marginTop: 6,
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    textAlign: "right",
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 6,
  },

  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginTop: 4,
  },
});
