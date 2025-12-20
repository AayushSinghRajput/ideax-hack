import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import voiceRecordingService from '../services/voiceRecordingService';
import productSearchService from '../services/productSearchService';

const VoiceSearchBar = ({ 
  onSearch, 
  onVoiceResult, 
  placeholder = "Search fresh produce..." 
}) => {
  const [searchText, setSearchText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle text search
  const handleTextSearch = async () => {
    if (!searchText.trim()) return;
    
    try {
      setIsProcessing(true);
      const result = await productSearchService.searchByText(searchText);
      onSearch && onSearch(result);
    } catch (error) {
      Alert.alert('Search Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice recording
  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessing(true);
      
      try {
        const recordingResult = await voiceRecordingService.stopRecording();
        
        if (recordingResult.success) {
          // Send voice to backend
          const searchResult = await productSearchService.searchByVoice(recordingResult);
          
          if (searchResult.success) {
            // Update search text with detected text
            if (searchResult.detectedText) {
              setSearchText(searchResult.detectedText);
            }
            
            // Pass results to parent
            onVoiceResult && onVoiceResult(searchResult);
            onSearch && onSearch(searchResult);
          } else {
            Alert.alert('Voice Search Failed', searchResult.error || 'Could not process voice');
          }
        } else {
          Alert.alert('Recording Failed', recordingResult.error);
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start recording
      try {
        const permissionResult = await voiceRecordingService.requestPermissions();
        
        if (permissionResult) {
          const startResult = await voiceRecordingService.startRecording();
          
          if (startResult.success) {
            setIsRecording(true);
          } else {
            Alert.alert('Recording Error', startResult.error);
          }
        }
      } catch (error) {
        Alert.alert('Permission Denied', 'Please enable microphone access');
      }
    }
  };

  // Handle text input submit
  const handleSubmit = () => {
    handleTextSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        {/* Search Icon */}
        <FontAwesome5
          name="search"
          size={16}
          color="#8e8e8e"
          style={styles.iconLeft}
        />
        
        {/* Text Input */}
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#bdbdbd"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        
        {/* Voice/Search Button */}
        <TouchableOpacity
          onPress={handleVoiceRecord}
          disabled={isProcessing}
          style={styles.iconButton}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : isRecording ? (
            // Recording indicator
            <View style={styles.recordingContainer}>
              <MaterialIcons name="mic" size={20} color="#FF3B30" />
              <View style={styles.recordingDot} />
            </View>
          ) : (
            // Voice icon
            <MaterialIcons name="keyboard-voice" size={22} color="#4CAF50" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Recording Status */}
      {isRecording && (
        <View style={styles.recordingStatus}>
          <Text style={styles.recordingText}>Recording... Speak now</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 40,
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 4,
  },
  recordingStatus: {
    marginTop: 8,
    alignItems: 'center',
  },
  recordingText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
  },
};

export default VoiceSearchBar;