// CORRECT IMPORTS: Keep expo-av for recording, use legacy file system
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

class VoiceRecordingService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.recordingInstance = null;
  }

  // Request permissions
  async requestPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Microphone permission not granted");
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      return true;
    } catch (error) {
      console.error("Permission error:", error);
      throw error;
    }
  }

  // Start recording
  async startRecording() {
    try {
      await this.requestPermissions();

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      // Use Recording.createAsync
      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      this.recording = recording;
      this.isRecording = true;

      return { success: true, message: "Recording started" };
    } catch (error) {
      console.error("Failed to start recording:", error);
      return { success: false, error: error.message };
    }
  }

  // Stop recording and get file
  async stopRecording() {
    try {
      if (!this.recording || !this.isRecording) {
        throw new Error("No active recording");
      }

      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;

      const uri = this.recording.getURI();

      // Get file info using legacy API (no deprecation warning with /legacy import)
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Convert audio to base64 using FileSystem.readAsStringAsync with base64 encoding
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Clean up
      this.recording = null;
      this.recordingInstance = null;

      return {
        success: true,
        uri,
        base64: base64Audio,
        filename: `recording_${Date.now()}.m4a`,
        size: fileInfo.size,
      };
    } catch (error) {
      console.error("Failed to stop recording:", error);
      return { success: false, error: error.message };
    }
  }

  // Convert audio to base64 (alternative method)
  async convertToBase64(uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Failed to convert audio:", error);
      return "";
    }
  }

  // Cancel recording
  cancelRecording() {
    if (this.recording) {
      this.recording.stopAndUnloadAsync();
      this.recording = null;
      this.isRecording = false;
      this.recordingInstance = null;
    }
  }
}

export default new VoiceRecordingService();