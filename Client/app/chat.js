import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { askQuestion, sendAnswer } from "../services/aiListingService";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    startConversation();
  }, []);

  // Start AI conversation
  const startConversation = async () => {
    setLoading(true);
    try {
      const res = await askQuestion();
      setMessages([{ from: "ai", text: res.question }]);
    } catch (err) {
      setMessages([{ from: "ai", text: "Failed to start conversation." }]);
    }
    setLoading(false);
  };

  // Send text answer
  const handleSend = async () => {
    if (!input.trim() || done) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    await sendToBackend(input);
  };

  // Send answer (text or mp3) to backend
  const sendToBackend = async (answerText, voiceUri = null) => {
    setLoading(true);
    try {
      let res;
      if (voiceUri) {
        const fileInfo = await FileSystem.readAsStringAsync(voiceUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        res = await sendAnswer(null, fileInfo); // sendAnswer(text, mp3Base64)
      } else {
        res = await sendAnswer(answerText);
      }

      if (res.done) {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "✅ Listing details collected successfully!" },
        ]);
        setDone(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: res.question },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Something went wrong. Try again." },
      ]);
    }
    setLoading(false);
  };

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.log("Recording error:", err);
    }
  };

  // Stop recording and send
  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await sendToBackend(null, uri);
    } catch (err) {
      console.log("Stop recording error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.from === "ai" ? styles.aiBubble : styles.userBubble,
              ]}
            >
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}

        {!done && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your answer..."
              placeholderTextColor="#a5d6a7"
            />

            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              disabled={loading}
            >
              <FontAwesome5 name="paper-plane" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voiceBtn, recording && styles.recordingBtn]}
              onPress={recording ? stopRecording : startRecording}
            >
              <FontAwesome5
                name={recording ? "microphone-slash" : "microphone"}
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e8f5e9" },
  container: { flex: 1 },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  aiBubble: {
    backgroundColor: "#a5d6a7",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#2e7d32",
    alignSelf: "flex-end",
  },
  text: { color: "#000", fontSize: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#c8e6c9",
    backgroundColor: "#388e3c",
  },
  input: {
    flex: 1,
    backgroundColor: "#a5d6a7",
    color: "#000",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#1b5e20",
    padding: 12,
    borderRadius: 24,
    marginRight: 8,
  },
  voiceBtn: {
    backgroundColor: "#1b5e20",
    padding: 12,
    borderRadius: 24,
  },
  recordingBtn: {
    backgroundColor: "#d32f2f",
  },
  loading: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#2e7d32",
    padding: 8,
    borderRadius: 12,
  },
});
