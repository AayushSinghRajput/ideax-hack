// CORRECT IMPORTS: Keep expo-av for recording, use legacy file system
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

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

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error("Audio file not found");
      }

      // Create audio file object for FormData
      const audioFile = {
        uri: uri,
        name: `recording_${Date.now()}.m4a`,
        type: 'audio/m4a',
        size: fileInfo.size,
      };

      // Clean up
      this.recording = null;
      this.recordingInstance = null;

      return {
        success: true,
        audioFile: audioFile,
        uri: uri,
        size: fileInfo.size,
        message: "Recording stopped successfully",
      };
    } catch (error) {
      console.error("Failed to stop recording:", error);
      return { success: false, error: error.message };
    }
  }

  // Cancel recording
  async cancelRecording() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
      this.recording = null;
      this.isRecording = false;
      return { success: true, message: "Recording cancelled" };
    } catch (error) {
      console.error("Cancel error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get current recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      hasRecording: !!this.recording,
    };
  }

  // Clean up resources
  async cleanup() {
    try {
      await this.cancelRecording();
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: false,
      });
      return { success: true };
    } catch (error) {
      console.error("Cleanup error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new VoiceRecordingService();