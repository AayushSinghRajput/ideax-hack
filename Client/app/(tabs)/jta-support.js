import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Linking,
  Clipboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { JTA_DATA } from "../../constants/jtaData";

export default function JTASupportScreen() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("All");
  const [filteredData, setFilteredData] = useState(JTA_DATA);
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState({}); // {trainerId: {sent: true, timestamp: Date.now(), method: 'app'}}

  const fields = ["All", "Agriculture", "Veterinary"];

  const extract10DigitNumber = (phoneString) => {
    // Remove all non-digit characters
    const digitsOnly = phoneString.replace(/\D/g, "");

    // Extract the last 10 digits
    const tenDigitNumber = digitsOnly.slice(-10);

    return tenDigitNumber;
  };

  const handlePhoneCall = async (phoneNumber, trainerName) => {
    try {
      const cleanNumber = extract10DigitNumber(phoneNumber);

      // Copy to clipboard
      await Clipboard.setString(cleanNumber);
      setCopiedNumber(cleanNumber);

      Alert.alert(
        "Phone Number Copied",
        `10-digit number ${cleanNumber} copied to clipboard for ${trainerName}. You can now paste it in your dialer.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Dialer",
            onPress: () => {
              const phoneUrl = `tel:${cleanNumber}`;
              Linking.openURL(phoneUrl).catch((err) => {
                Alert.alert(
                  "Error",
                  "Could not open dialer. Please dial manually."
                );
              });
            },
          },
        ]
      );

      // Reset copied number after 3 seconds
      setTimeout(() => {
        setCopiedNumber(null);
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy phone number. Please try again.");
    }
  };

  const handleMessagePress = (phoneNumber, trainerName, trainerId) => {
    const cleanNumber = extract10DigitNumber(phoneNumber);

    // Check if WhatsApp was recently sent (within last 30 seconds)
    const status = whatsappStatus[trainerId];
    if (status && status.sent && Date.now() - status.timestamp < 30000) {
      const method = status.method === "app" ? "WhatsApp" : "WhatsApp Web";
      Alert.alert(
        "Message Recently Sent",
        `You sent a message via ${method} to ${trainerName} recently. Do you want to send another message?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Send Another",
            onPress: () => {
              // Clear the status so user can send again
              setWhatsappStatus((prev) => {
                const newState = { ...prev };
                delete newState[trainerId];
                return newState;
              });
              // Show contact options
              showContactOptions(cleanNumber, trainerName, trainerId);
            },
          },
        ]
      );
      return;
    }

    // If status is older than 30 seconds, clear it
    if (status && Date.now() - status.timestamp >= 30000) {
      setWhatsappStatus((prev) => {
        const newState = { ...prev };
        delete newState[trainerId];
        return newState;
      });
    }

    showContactOptions(cleanNumber, trainerName, trainerId);
  };

  const showContactOptions = (cleanNumber, trainerName, trainerId) => {
    Alert.alert(
      "Send Message",
      `How would you like to contact ${trainerName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "WhatsApp",
          onPress: () =>
            sendWhatsAppMessage(cleanNumber, trainerName, trainerId, "app"),
        },
        {
          text: "WhatsApp Web",
          onPress: () =>
            sendWhatsAppMessage(cleanNumber, trainerName, trainerId, "web"),
        },
        {
          text: "SMS",
          onPress: () => sendSMS(cleanNumber, trainerName),
        },
      ]
    );
  };

  const sendWhatsAppMessage = async (
    cleanNumber,
    trainerName,
    trainerId,
    method
  ) => {
    // Validate we have a 10-digit number
    if (
      !cleanNumber ||
      cleanNumber.length !== 10 ||
      !/^\d+$/.test(cleanNumber)
    ) {
      Alert.alert(
        "Invalid Phone Number",
        `The phone number (${cleanNumber}) is not valid. Please try SMS instead.`,
        [
          {
            text: "Send SMS",
            onPress: () => sendSMS(cleanNumber, trainerName),
          },
        ]
      );
      return;
    }

    // WhatsApp expects: country code + number (without + or 00)
    // For Nepal: 977 + 10-digit number
    const whatsappNumber = `977${cleanNumber}`;

    const message = `Hello ${trainerName}, I need your assistance from the Agriculture Support App.`;

    let url;
    if (method === "app") {
      // WhatsApp App URL
      url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(
        message
      )}`;
    } else {
      // WhatsApp Web URL
      url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;
    }

    try {
      // Try to open the URL
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        // Set optimistic status immediately
        setWhatsappStatus((prev) => ({
          ...prev,
          [trainerId]: {
            sent: true,
            timestamp: Date.now(),
            method: method,
          },
        }));

        // Try to open the URL
        const opened = await Linking.openURL(url);

        if (opened) {
          // Success - show confirmation
          const methodName = method === "app" ? "WhatsApp" : "WhatsApp Web";
          Alert.alert(
            "Success!",
            `${methodName} has been opened with ${trainerName}'s number. You can now send your message.`,
            [{ text: "OK" }]
          );

          // Auto-reset after 15 seconds
          setTimeout(() => {
            setWhatsappStatus((prev) => {
              const currentStatus = prev[trainerId];
              if (
                currentStatus &&
                Date.now() - currentStatus.timestamp >= 15000
              ) {
                const newState = { ...prev };
                delete newState[trainerId];
                return newState;
              }
              return prev;
            });
          }, 15000);
        }
      } else {
        // If app method fails and we tried app, fallback to web
        if (method === "app") {
          Alert.alert(
            "WhatsApp App Not Available",
            "WhatsApp app is not installed. Would you like to use WhatsApp Web instead?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Use WhatsApp Web",
                onPress: () =>
                  sendWhatsAppMessage(
                    cleanNumber,
                    trainerName,
                    trainerId,
                    "web"
                  ),
              },
            ]
          );
        } else {
          // Web also failed
          showFallbackOptions(
            cleanNumber,
            trainerName,
            "Could not open WhatsApp"
          );
        }
      }
    } catch (error) {
      console.log("Error opening WhatsApp:", error);
      showFallbackOptions(cleanNumber, trainerName, "Error opening WhatsApp");
    }
  };

  const sendSMS = (cleanNumber, trainerName) => {
    // For SMS in Nepal, use 10-digit number directly
    const smsBody = `Hello ${trainerName}, I need your assistance from the Agriculture Support App.`;

    let smsUrl;
    if (Platform.OS === "ios") {
      // iOS: sms:9805981165&body=Hello
      smsUrl = `sms:${cleanNumber}&body=${encodeURIComponent(smsBody)}`;
    } else {
      // Android: sms:9805981165?body=Hello
      smsUrl = `sms:${cleanNumber}?body=${encodeURIComponent(smsBody)}`;
    }

    Linking.openURL(smsUrl).catch(() => {
      // Fallback: Copy number to clipboard
      Clipboard.setString(cleanNumber);
      Alert.alert(
        "Number Copied",
        `Phone number ${cleanNumber} copied to clipboard. You can paste it in your messaging app.\n\nMessage: ${smsBody}`,
        [{ text: "OK" }]
      );
    });
  };

  const showFallbackOptions = (cleanNumber, trainerName, reason) => {
    Alert.alert(
      "WhatsApp Not Available",
      `${reason}. Choose another way to contact ${trainerName}:`,
      [
        {
          text: "Send SMS",
          onPress: () => sendSMS(cleanNumber, trainerName),
        },
        {
          text: "Copy Phone Number",
          onPress: () => {
            Clipboard.setString(cleanNumber);
            Alert.alert(
              "Copied",
              `Phone number ${cleanNumber} copied to clipboard.`
            );
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleVideoCall = async (trainerName) => {
    const meetUrl = "https://meet.google.com";
    try {
      Alert.alert(
        "Start Video Call",
        `Start a Google Meet video call with ${trainerName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start",
            onPress: async () => {
              try {
                await Linking.openURL(meetUrl);
              } catch (openError) {
                console.error("Linking.openURL error:", openError);
                Alert.alert(
                  "Google Meet Error",
                  `Failed to open Google Meet.\n\nError Details:\n${
                    openError?.message || openError
                  }`
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Video call handler error:", error);

      Alert.alert(
        "Unexpected Error",
        `Something went wrong while starting the video call.\n\nError Details:\n${
          error?.message || error
        }`
      );
    }
  };

  const handleSearch = (query = searchQuery, field = selectedField) => {
    let filtered = JTA_DATA;

    if (query.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.qualification.toLowerCase().includes(query.toLowerCase()) ||
          item.specialization.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (field !== "All") {
      filtered = filtered.filter((item) => item.field === field);
    }

    setFilteredData(filtered);
  };

  const handleFieldSelect = (field) => {
    setSelectedField(field);
    handleSearch(searchQuery, field);
  };

  const handleSearchSubmit = () => {
    handleSearch();
    setSearchModalVisible(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedField("All");
    setFilteredData(JTA_DATA);
  };

  const resetWhatsAppStatus = (trainerId) => {
    setWhatsappStatus((prev) => {
      const newState = { ...prev };
      delete newState[trainerId];
      return newState;
    });
    Alert.alert(
      "Reset",
      "WhatsApp status has been reset. You can send a new message."
    );
  };

  const renderItem = ({ item }) => {
    const status = whatsappStatus[item.id];
    const hasRecentMessage =
      status && status.sent && Date.now() - status.timestamp < 30000;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.availabilityBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isOnline ? "#4CAF50" : "#9E9E9E" },
              ]}
            />
            <Text style={styles.statusText}>
              {item.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
          <Text style={styles.responseTime}>{item.responseTime}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.profileImage}
            />
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            </View>

            <Text style={styles.qualification}>{item.qualification}</Text>

            <View style={styles.phoneContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={14} color="#4CAF50" />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={14} color="#4CAF50" />
              <Text style={styles.infoText}>{item.field}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={14} color="#4CAF50" />
              <Text style={styles.infoText}>{item.specialization}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#4CAF50" />
              <Text style={styles.infoText}>
                {item.experience} years experience
              </Text>
            </View>

            <View style={styles.languageContainer}>
              {item.languages.map((lang, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageText}>{lang}</Text>
                </View>
              ))}
            </View>

            {/* WhatsApp Status Indicator */}
            {hasRecentMessage && (
              <TouchableOpacity
                style={styles.whatsappStatusContainer}
                onPress={() => resetWhatsAppStatus(item.id)}
              >
                <Ionicons name="checkmark-circle" size={14} color="#25D366" />
                <Text style={styles.whatsappStatusText}>
                  Message sent via{" "}
                  {status.method === "app" ? "WhatsApp" : "WhatsApp Web"} ✓
                </Text>
                <Ionicons
                  name="refresh"
                  size={12}
                  color="#666"
                  style={styles.resetIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              copiedNumber === extract10DigitNumber(item.phone) &&
                styles.iconButtonActive,
            ]}
            onPress={() => handlePhoneCall(item.phone, item.name)}
          >
            {copiedNumber === extract10DigitNumber(item.phone) ? (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            ) : (
              <Ionicons name="call" size={18} color="#4CAF50" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.messageButton,
              hasRecentMessage && styles.messageButtonSuccess,
            ]}
            onPress={() => handleMessagePress(item.phone, item.name, item.id)}
          >
            {hasRecentMessage ? (
              <>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.messageButtonText}>Message Sent</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.messageButtonText}>Message</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleVideoCall(item.name)}
          >
            <Ionicons name="videocam" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>JTA Support</Text>
          <Text style={styles.subtitle}>Connect with our expert trainers</Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search" size={24} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Showing</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredData.filter((item) => item.isOnline).length}
          </Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Object.keys(whatsappStatus).length}
          </Text>
          <Text style={styles.statLabel}>Recent Messages</Text>
        </View>
      </View>

      {/* Search Summary */}
      {(searchQuery !== "" || selectedField !== "All") && (
        <View style={styles.searchSummary}>
          <View style={styles.searchSummaryContent}>
            <Text style={styles.searchSummaryText}>
              Showing results for:
              {searchQuery !== "" && ` "${searchQuery}"`}
              {selectedField !== "All" && ` in ${selectedField}`}
            </Text>
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#666" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Trainer List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Available Trainers</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#C8E6C9" />
            <Text style={styles.emptyTitle}>No trainers found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filter criteria
            </Text>
            <TouchableOpacity onPress={clearSearch} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Trainers</Text>
              <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1B5E20" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, qualification, or specialization..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Field Filter Section */}
            <Text style={styles.filterTitle}>Filter by Field</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fieldContainer}
            >
              {fields.map((field) => (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.fieldButton,
                    selectedField === field && styles.fieldButtonActive,
                  ]}
                  onPress={() => handleFieldSelect(field)}
                >
                  <Text
                    style={[
                      styles.fieldButtonText,
                      selectedField === field && styles.fieldButtonTextActive,
                    ]}
                  >
                    {field}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Active Filters */}
            <View style={styles.activeFilters}>
              {searchQuery !== "" && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Search: {searchQuery}
                  </Text>
                </View>
              )}
              {selectedField !== "All" && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Field: {selectedField}
                  </Text>
                </View>
              )}
            </View>

            {/* Results Count */}
            <View style={styles.resultsCount}>
              <Text style={styles.resultsCountText}>
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "trainer" : "trainers"} found
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSearchModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleSearchSubmit}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9F5",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 4,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B5E20",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    height: "60%",
    alignSelf: "center",
  },
  searchSummary: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchSummaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchSummaryText: {
    fontSize: 14,
    color: "#1B5E20",
    flex: 1,
    marginRight: 12,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B5E20",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  // Card Styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#F9FDF9",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F8E9",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B5E20",
  },
  responseTime: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  profileSection: {
    marginRight: 16,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#4CAF50",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF8F00",
    marginLeft: 4,
  },
  detailsSection: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginRight: 6,
  },
  qualification: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
    marginBottom: 8,
  },
  phoneContainer: {
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#4CAF50",
    marginLeft: 8,
  },
  whatsappStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  whatsappStatusText: {
    fontSize: 12,
    color: "#1B5E20",
    fontWeight: "600",
    marginLeft: 6,
    marginRight: 8,
  },
  resetIcon: {
    marginLeft: 4,
  },
  languageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  languageTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 11,
    color: "#1B5E20",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FDF9",
    borderTopWidth: 1,
    borderTopColor: "#F1F8E9",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  iconButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },
  messageButtonSuccess: {
    backgroundColor: "#25D366",
  },
  messageButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1B5E20",
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F9F5",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    marginRight: 12,
  },
  fieldButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  fieldButtonText: {
    fontSize: 14,
    color: "#1B5E20",
    fontWeight: "500",
  },
  fieldButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  activeFilterTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#1B5E20",
  },
  resultsCount: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: "#F5F9F5",
    borderRadius: 12,
  },
  resultsCountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    marginRight: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  videoCallHint: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
    textAlign: "center",
  },
});
