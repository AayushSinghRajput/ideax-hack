// components/ChatScreen.js (FIXED - No this.flatList error)
import React, { useEffect, useState, useRef } from "react";
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
  Alert,
  Linking,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { askQuestion, sendAnswer, getApiUrl } from "../services/aiListingService";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Checking connection...");
  
  // Create ref for FlatList
  const flatListRef = useRef(null);

  useEffect(() => {
    startConversation();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Start AI conversation
  const startConversation = async () => {
    setLoading(true);
    setConnectionStatus("Connecting to server...");
    try {
      const res = await askQuestion();
      
      // Check if response is an error message
      if (res.question && res.question.includes('CONNECTION ERROR')) {
        setConnectionStatus("Connection failed ✗");
        setMessages([{ 
          from: "ai", 
          text: `${res.question}\n\nServer URL: ${getApiUrl()}\n\nTry opening in browser first:`
        }]);
      } else {
        setConnectionStatus("Connected ✓");
        setMessages([{ from: "ai", text: res.question }]);
        console.log("Conversation started:", res.question);
      }
    } catch (err) {
      console.error("Start conversation error:", err);
      setConnectionStatus("Connection failed ✗");
      setMessages([{ 
        from: "ai", 
        text: `Failed to start conversation.\n\nError: ${err.message}\n\nServer URL: ${getApiUrl()}\n\nPlease check:\n1. FastAPI is running on laptop\n2. Disable Windows Firewall\n3. Test in browser first` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Send text answer
  const handleSend = async () => {
    if (!input.trim() || done) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    await sendToBackend(currentInput, null);
  };

  // Send answer (text or audio) to backend
  const sendToBackend = async (answerText, voiceUri = null) => {
    setLoading(true);
    try {
      console.log("Sending to backend - Text:", answerText, "Voice URI:", voiceUri);
      const res = await sendAnswer(answerText, voiceUri);

      if (res.done && res.machineData) {
        // Successfully collected all data
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "✅ Listing details collected successfully!" },
        ]);
        setDone(true);
        
        // Navigate to machine form with AI draft data after delay
        setTimeout(() => {
          if (navigation) {
            navigation.navigate('MachineForm', { aiDraft: res.machineData });
          }
        }, 1500);
        
      } else if (res.question) {
        // Continue conversation
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: res.question },
        ]);
      } else {
        // Handle unexpected response
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "Please continue with your answer." },
        ]);
      }
    } catch (err) {
      console.error("Error in sendToBackend:", err);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      console.log("Requesting recording permissions...");
      
      // Request permissions
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      if (micStatus !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Microphone permission is needed to record audio."
        );
        return;
      }
      
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      
      console.log("Creating recording...");
      
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
      
    } catch (err) {
      console.error("Recording error:", err);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again."
      );
    }
  };

  // Stop recording and send
  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      console.log("Stopping recording...");
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      console.log("Recording stopped, URI:", uri);
      
      // Add user message for audio
      setMessages((prev) => [
        ...prev,
        { from: "user", text: "🎤 Voice message" },
      ]);
      
      // Send audio to backend
      await sendToBackend(null, uri);
      
    } catch (err) {
      console.error("Stop recording error:", err);
      Alert.alert(
        "Error",
        "Failed to process recording. Please try again."
      );
    }
  };

  // Test connection in browser
  const testInBrowser = () => {
    const url = getApiUrl();
    console.log("Opening browser to:", url);
    Linking.openURL(url).catch(err => {
      Alert.alert("Error", `Cannot open browser: ${err.message}`);
    });
  };

  // Retry connection
  const retryConnection = () => {
    setMessages([]);
    startConversation();
  };

  const renderMessageItem = ({ item, index }) => (
    <View
      style={[
        styles.bubble,
        item.from === "ai" ? styles.aiBubble : styles.userBubble,
      ]}
      key={index}
    >
      {item.from === "ai" && (
        <FontAwesome5 
          name="robot" 
          size={16} 
          color="#2E7D32" 
          style={styles.botIcon}
        />
      )}
      <Text style={[
        styles.text,
        item.from === "ai" ? styles.aiText : styles.userText
      ]}>
        {item.text}
      </Text>
      {item.from === "user" && (
        <FontAwesome5 
          name="user" 
          size={16} 
          color="#fff" 
          style={styles.userIcon}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>AI Listing Assistant</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryConnection}
              disabled={loading}
            >
              <FontAwesome5 name="sync" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Answer questions to create your machine listing
          </Text>
          <Text style={styles.serverUrl}>
            Server: {getApiUrl()}
          </Text>
          <View style={[
            styles.statusIndicator,
            connectionStatus.includes("Connected") ? styles.statusConnected : styles.statusDisconnected
          ]}>
            <FontAwesome5 
              name={connectionStatus.includes("Connected") ? "wifi" : "wifi-slash"} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </View>
        </View>

        {/* Messages List - Using ref instead of this.flatList */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {/* Connection Test Button */}
        {!done && messages.length === 0 && (
          <View style={styles.testContainer}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={testInBrowser}
            >
              <FontAwesome5 name="chrome" size={18} color="#fff" />
              <Text style={styles.testButtonText}>Test Server in Browser</Text>
            </TouchableOpacity>
            <Text style={styles.testHint}>
              If this doesn't load, fix firewall first
            </Text>
          </View>
        )}

        {/* Input Area - Only show if not done */}
        {!done && messages.length > 0 && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your answer here..."
              placeholderTextColor="#81C784"
              multiline
              maxLength={500}
              editable={!loading && !isRecording}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.sendButton,
                  (!input.trim() || loading) && styles.disabledButton
                ]}
                onPress={handleSend}
                disabled={!input.trim() || loading}
              >
                <FontAwesome5 
                  name="paper-plane" 
                  size={18} 
                  color="#fff" 
                />
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.voiceButton,
                  isRecording && styles.recordingButton,
                  loading && styles.disabledButton
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={loading}
              >
                <FontAwesome5
                  name={isRecording ? "stop-circle" : "microphone"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.buttonText}>
                  {isRecording ? "Stop" : "Voice"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <ActivityIndicator size="small" color="#D32F2F" />
                <Text style={styles.recordingText}>Recording... Speak now</Text>
              </View>
            )}
          </View>
        )}

        {/* Done State */}
        {done && (
          <View style={styles.doneContainer}>
            <FontAwesome5 
              name="check-circle" 
              size={48} 
              color="#4CAF50" 
              style={styles.doneIcon}
            />
            <Text style={styles.doneTitle}>All Done!</Text>
            <Text style={styles.doneText}>
              Your machine details have been collected.
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                if (navigation) {
                  navigation.navigate('MachineForm');
                }
              }}
            >
              <Text style={styles.continueButtonText}>
                Continue to Machine Form
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  retryButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#C8E6C9",
    marginBottom: 8,
  },
  serverUrl: {
    fontSize: 11,
    color: "#A5D6A7",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusConnected: {
    backgroundColor: "#2E7D32",
  },
  statusDisconnected: {
    backgroundColor: "#D32F2F",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  bubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  aiBubble: {
    backgroundColor: "#A5D6A7",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#2E7D32",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  botIcon: {
    marginRight: 8,
  },
  userIcon: {
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  aiText: {
    color: "#1B5E20",
  },
  userText: {
    color: "#fff",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#C8E6C9",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#1B5E20",
    fontSize: 14,
    fontWeight: "500",
  },
  testContainer: {
    padding: 20,
    alignItems: "center",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
  testHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "#388E3C",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#2E7D32",
  },
  input: {
    backgroundColor: "#A5D6A7",
    color: "#1B5E20",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 50,
    maxHeight: 150,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: "#81C784",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButton: {
    backgroundColor: "#1B5E20",
  },
  voiceButton: {
    backgroundColor: "#1B5E20",
  },
  recordingButton: {
    backgroundColor: "#D32F2F",
  },
  disabledButton: {
    backgroundColor: "#81C784",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#FFCDD2",
    borderRadius: 8,
  },
  recordingText: {
    color: "#D32F2F",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  doneContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#C8E6C9",
    margin: 16,
    borderRadius: 20,
    elevation: 4,
  },
  doneIcon: {
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 8,
  },
  doneText: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});