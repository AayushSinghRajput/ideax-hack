import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import CropForm from "../components/CropForm";
import OrderProduct from "../components/OrderProduct";
import EditProductForm from "../components/EditProductForm";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import FavoriteFarmers from "../components/FavoriteFarmers";
import { fetchTodayMarketPrices } from "../services/marketPriceService";
import { toNepaliNumber } from "../utils/numberConverter";
import Constants from "expo-constants";
import VoiceRecordingService from "../services/voiceRecordingService";
import VoiceTranscriptionService from "../services/voiceTranscriptionService";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

// Crop images mapping
const cropImages = {
  // Vegetables
  carrots: require("../assets/images/carrot.jpg"),
  spinach: require("../assets/images/spinach.jpg"),
  onions: require("../assets/crops/onion.jpg"),
  potatoes: require("../assets/crops/potato.jpg"),
  beans: require("../assets/images/beans.jpg"),
  tomatoes: require("../assets/images/tomato.jpg"),

  // Fruits
  corn: require("../assets/images/corn.jpg"),
  wheat: require("../assets/crops/wheat.jpg"),
  rice: require("../assets/crops/rice.jpg"),
  apples: require("../assets/images/apple.jpg"),
  bananas: require("../assets/images/banana.jpg"),

  // Grains
  barley: require("../assets/images/barley.jpg"),
  oats: require("../assets/images/oats.jpg"),

  // Default fallback
  default: require("../assets/crops/wheat.jpg"),
};

// Helper function to get crop image
const getCropImage = (cropName) => {
  if (!cropName) return cropImages.default;

  const normalizedName = cropName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z]/g, "");

  if (cropImages[normalizedName]) {
    return cropImages[normalizedName];
  }

  const cropKeys = Object.keys(cropImages);
  const partialMatch = cropKeys.find(
    (key) => normalizedName.includes(key) || key.includes(normalizedName)
  );

  return partialMatch ? cropImages[partialMatch] : cropImages.default;
};

// Static data for My Active Listings only
const staticActiveListing = {
  name: "Fresh Tomatoes",
  price: "Rs45/kg",
  available: "50kg",
  views: 12,
  inquiries: 3,
};

const messages = [
  {
    id: "m1",
    name: "Shyam Maharjan",
    msg: "Interested in your tomatoes. Can we discuss?",
    time: "2 min ago",
  },
];

const filterOptions = ["All", "Vegetables", "Fruits", "Grains", "Near Me"];

// Debug function to check for duplicate IDs
const debugProductIds = (products) => {
  if (!products || products.length === 0) return;

  const ids = products.map((p) => p.id);
  const uniqueIds = [...new Set(ids)];

  if (ids.length !== uniqueIds.length) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    console.error("Duplicates:", [...new Set(duplicates)]);

    // Find products with duplicate IDs
    const duplicateProducts = products.filter((p) => duplicates.includes(p.id));
    console.error("Products with duplicate IDs:", duplicateProducts);
  }

  // Check for null/undefined/empty IDs
  const invalidIds = products.filter((p) => !p.id || p.id === "");
  if (invalidIds.length > 0) {
    console.error("❌ Products with invalid IDs:", invalidIds);
  }
};

export default function RentCrop({ navigation }) {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [marketPrices, setMarketPrices] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [searchMode, setSearchMode] = useState("text"); // 'text' or 'voice'

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Use refs for cleanup
  const isMountedRef = useRef(true);
  const autoStopTimeoutRef = useRef(null);

  const navigate = useNavigation();

  // State for OrderProduct popup
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for EditProductForm popup
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Clear any pending timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
    };
  }, []);

  // Handle voice search button press
  const handleVoiceSearch = async () => {
    try {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        setIsProcessingVoice(true);

        // Clear auto-stop timeout
        if (autoStopTimeoutRef.current) {
          clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = null;
        }

        const recordingResult = await VoiceRecordingService.stopRecording();

        if (recordingResult.success && recordingResult.audioFile) {
          await processVoiceRecording(recordingResult.audioFile);
        } else {
          Alert.alert(
            "Recording Error",
            recordingResult.error || "Failed to process recording"
          );
          setIsProcessingVoice(false);
        }
      } else {
        // Start recording
        const startResult = await VoiceRecordingService.startRecording();

        if (startResult.success) {
          setIsRecording(true);

          // Auto-stop after 10 seconds (safety)
          autoStopTimeoutRef.current = setTimeout(async () => {
            if (isMountedRef.current && VoiceRecordingService.isRecording) {
              await handleVoiceSearch(); // Auto-stop
            }
          }, 10000);
        } else {
          Alert.alert(
            "Recording Error",
            startResult.error || "Failed to start recording"
          );
        }
      }
    } catch (error) {
      console.error("Voice search error:", error);
      Alert.alert("Error", "Voice search failed. Please try again.");
      setIsRecording(false);
      setIsProcessingVoice(false);

      // Cleanup timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }
    }
  };

  // Process voice recording
  const processVoiceRecording = async (audioFile) => {
    try {
      console.log("Processing voice recording:", audioFile);

      // Show processing indicator
      Alert.alert(
        "Processing",
        "Transcribing your voice...",
        [{ text: "OK", onPress: () => {} }],
        { cancelable: false }
      );

      // Step 1: Send to backend for transcription
      const transcriptionResult =
        await VoiceTranscriptionService.transcribeAudio(audioFile);

      if (!transcriptionResult.success) {
        // Fallback to simulated voice search
        console.log(
          "Transcription failed, using fallback:",
          transcriptionResult.error
        );
        await useSimulatedVoiceSearch();
        return;
      }

      // Step 2: Get transcribed text
      const transcribedText = transcriptionResult.text;

      if (!transcribedText || transcribedText.trim().length === 0) {
        Alert.alert(
          "No Speech Detected",
          "No words were detected in your recording. Please try again.",
          [{ text: "OK" }]
        );
        setIsProcessingVoice(false);
        return;
      }

      // Step 3: Convert to search term
      const searchTerm =
        VoiceTranscriptionService.convertToSearchTerm(transcribedText);

      // Step 4: Extract crops for display
      const extractedCrops =
        VoiceTranscriptionService.extractCropNames(transcribedText);
      const nepaliDisplay =
        extractedCrops.length > 0
          ? extractedCrops[0].nepali
          : VoiceTranscriptionService.getNepaliEquivalent(searchTerm);

      // Step 5: Apply the search
      console.log("Setting search term:", searchTerm);
      setSearchText(searchTerm);
      setSearchMode("voice");

      // Step 6: Filter products
      const filtered = products.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.desc &&
            item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Step 7: Show results
      Alert.alert(
        "Voice Search Results",
        `Transcription: "${transcribedText}"\n\nDetected: "${nepaliDisplay}"\nSearching for: "${searchTerm}"\n\nFound ${filtered.length} matching products.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Optional: Scroll to show results
              if (filtered.length > 0) {
                // You could add scroll logic here
              }
            },
          },
        ]
      );

      // Log for debugging
      console.log("Voice search completed:", {
        original: transcribedText,
        searchTerm: searchTerm,
        matches: filtered.length,
        cropsDetected: extractedCrops,
      });
    } catch (error) {
      console.error("Voice processing error:", error);

      // Fallback to simulated search
      await useSimulatedVoiceSearch();
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Helper function for fallback voice search
  const useSimulatedVoiceSearch = async () => {
    try {
      // Fallback simulation with English crop names
      const simulatedWords = [
        "tomato",
        "potato",
        "onion",
        "carrot",
        "rice",
        "banana",
        "apple",
        "corn",
        "wheat",
      ];
      const randomWord =
        simulatedWords[Math.floor(Math.random() * simulatedWords.length)];
      const nepaliWord =
        VoiceTranscriptionService.getNepaliEquivalent(randomWord);

      setSearchText(randomWord);
      setSearchMode("voice");

      const filtered = products.filter(
        (item) =>
          item.name.toLowerCase().includes(randomWord) ||
          item.category.toLowerCase().includes(randomWord)
      );

      Alert.alert(
        "Voice Search (Demo Mode)",
        `Backend service is unavailable. Using demo mode.\n\nSearching for: "${randomWord}" (${nepaliWord})\n\nFound ${filtered.length} products.`,
        [{ text: "OK" }]
      );
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
      Alert.alert("Error", "Voice search failed. Please try typing instead.");
    }
  };



  // Load products from database
  const loadProductsFromDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add safety check for data structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("Invalid API response structure:", data);
        setProducts([]);
        return;
      }

      // Transform the API response with better ID handling
      const transformedProducts = data.data.map((product, index) => {
        // Ensure unique ID - use _id or create fallback
        const uniqueId = product._id || `product-${Date.now()}-${index}`;

        return {
          id: uniqueId,
          category: product.category || "Other",
          name: product.productName || "Unknown Product",
          desc: product.description || "No description available",
          price: `Rs${product.price || 0}/${product.unit || "kg"}`,
          available: product.quantity || 0,
          unit: product.unit || "kg",
          distance: product.location
            ? `${Math.floor(Math.random() * 10) + 1} km from ${
                product.location
              }`
            : "N/A",
          heart: false,
          isUserListed: user && product.farmer_id === user.id,
          location: product.location || "",
          deliveryHome: product.deliveryOption === "home_delivery",
          deliveryPickup: product.deliveryOption === "self_pickup",
          imageUrl: product.productImage
            ? `${API_BASE_URL.replace(
                "/api",
                ""
              )}/${product.productImage.replace(/\\/g, "/")}`
            : null,
          views: product.views || 0,
          inquiries: product.inquiries || 0,
          farmer_name: product.farmer_name || "Local Farmer",
          farmer_contact: product.farmer_contact || "N/A",
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        };
      });

      // Debug products before setting state
      debugProductIds(transformedProducts);

      // Ensure no duplicates by creating a Map with unique IDs
      const uniqueProducts = [];
      const seenIds = new Set();

      transformedProducts.forEach((product) => {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          uniqueProducts.push(product);
        } else {
          console.warn("Skipping duplicate product:", product);
        }
      });

      setProducts(uniqueProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      Alert.alert(
        "Error",
        "Failed to load products. Please check your internet connection and try again.",
        [
          { text: "Retry", onPress: () => loadProductsFromDatabase() },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadProductsFromDatabase();
    } catch (error) {
      console.error("Error refreshing products:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadProductsFromDatabase]);

  // Load products on component mount
  useEffect(() => {
    loadProductsFromDatabase();
  }, [loadProductsFromDatabase]);

  // Debug products when they change
  useEffect(() => {
    if (products.length > 0) {
      debugProductIds(products);
    }
  }, [products]);

  // Simple local favorite toggle
  const toggleHeart = useCallback((id) => {
    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === id ? { ...item, heart: !item.heart } : item
      )
    );
  }, []);

  // Delete product function
  const handleDeleteProduct = useCallback(async (productId, productName) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/products/${productId}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              // Remove from local state
              setProducts((prevProducts) =>
                prevProducts.filter((product) => product.id !== productId)
              );

              Alert.alert("Success", "Product deleted successfully!");
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert(
                "Error",
                "Failed to delete product. Please try again."
              );
            }
          },
        },
      ]
    );
  }, []);

  const loadMarketPrices = useCallback(async () => {
    try {
      setPriceLoading(true);
      const data = await fetchTodayMarketPrices();
      setMarketPrices(data);
    } catch (err) {
      console.error("Market price load error:", err.message);
      setMarketPrices([]);
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "farmer") {
      loadMarketPrices();
    }
  }, [user, loadMarketPrices]);

  // Edit product function
  const handleEditProduct = useCallback((product) => {
    setProductToEdit(product);
    // Use setTimeout to prevent state update during render
    setTimeout(() => {
      setEditModalVisible(true);
    }, 0);
  }, []);

  // Handle edit form submission
  const handleEditFormSubmit = useCallback(
    async (formData) => {
      try {
        const productData = {
          productName: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity) || 0,
          unit: formData.unit,
          location: formData.location,
          deliveryOption: formData.delivery_home
            ? "home_delivery"
            : "self_pickup",
        };

        const response = await fetch(
          `${API_BASE_URL}/products/${productToEdit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedProduct = await response.json();

        // Update local state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productToEdit.id
              ? {
                  ...product,
                  name: updatedProduct.productName,
                  desc: updatedProduct.description,
                  price: `Rs${updatedProduct.price}/${
                    updatedProduct.unit || "kg"
                  }`,
                  available: updatedProduct.quantity,
                  unit: updatedProduct.unit || "kg",
                  location: updatedProduct.location,
                  deliveryHome:
                    updatedProduct.deliveryOption === "home_delivery",
                  deliveryPickup:
                    updatedProduct.deliveryOption === "self_pickup",
                  updated_at: updatedProduct.updatedAt,
                }
              : product
          )
        );

        Alert.alert("Success", "Product updated successfully!");

        // Use setTimeout to prevent state update during render
        setTimeout(() => {
          setEditModalVisible(false);
          setProductToEdit(null);
        }, 0);
      } catch (error) {
        console.error("Error updating product:", error);
        Alert.alert("Error", "Failed to update product. Please try again.");
      }
    },
    [productToEdit]
  );

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter((item) => {
      const productName = item.name || "";
      const productLocation = item.location || "";
      const productCategory = item.category || "";

      const matchesSearch = productName
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());

      if (selectedFilter === "All") {
        return matchesSearch;
      }
      if (selectedFilter === "Near Me") {
        return matchesSearch && productLocation.includes("Dharan");
      }
      return matchesSearch && productCategory === selectedFilter;
    });
  }, [products, searchText, selectedFilter]);

  // Sort products
  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (a.heart !== b.heart) {
        return a.heart ? -1 : 1;
      }
      if (a.isUserListed !== b.isUserListed) {
        return a.isUserListed ? -1 : 1;
      }
      return 0;
    });
  }, [filteredProducts]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        const productData = {
          productName: formData.name,
          description:
            formData.description ||
            `Fresh ${formData.type.toLowerCase()} from local farm`,
          category: formData.type,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity) || 0,
          unit: formData.unit,
          location: formData.location,
          deliveryOption: formData.delivery_home
            ? "home_delivery"
            : "self_pickup",
          farmer_id: user?.id,
          farmer_name: user?.name,
          farmer_contact: user?.contact,
        };

        const response = await fetch(`${API_BASE_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const createdProduct = await response.json();

        // Create new product with unique ID
        const newProduct = {
          id: createdProduct._id || `new-${Date.now()}`,
          category: createdProduct.category,
          name: createdProduct.productName,
          desc: createdProduct.description,
          price: `Rs${createdProduct.price}/${createdProduct.unit || "kg"}`,
          available: createdProduct.quantity,
          unit: createdProduct.unit || "kg",
          distance: "0 km",
          heart: false,
          isUserListed: true,
          location: createdProduct.location,
          deliveryHome: createdProduct.deliveryOption === "home_delivery",
          deliveryPickup: createdProduct.deliveryOption === "self_pickup",
          imageUrl: createdProduct.productImage
            ? `${API_BASE_URL.replace(
                "/api",
                ""
              )}/${createdProduct.productImage.replace(/\\/g, "/")}`
            : null,
          views: 0,
          inquiries: 0,
          farmer_name: createdProduct.farmer_name,
          farmer_contact: createdProduct.farmer_contact,
          created_at: createdProduct.createdAt,
          updated_at: createdProduct.updatedAt,
        };

        // Add to local state
        setProducts((prevProducts) => [newProduct, ...prevProducts]);

        Alert.alert("Success", "Your product has been listed successfully!");

        // Use setTimeout to prevent state update during render
        setTimeout(() => {
          setModalVisible(false);
        }, 0);
      } catch (error) {
        console.error("Error creating product:", error);
        Alert.alert("Error", "Failed to create product. Please try again.");
      }
    },
    [user]
  );

  // Open order modal
  const onOrderPress = useCallback((product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      setOrderModalVisible(true);
    }, 0);
  }, []);

  // Close order modal
  const onOrderClose = useCallback(() => {
    setTimeout(() => {
      setOrderModalVisible(false);
      setSelectedProduct(null);
    }, 0);
  }, []);

  // Handle successful order
  const handleOrderSuccess = useCallback(
    async (productId, orderedQuantity) => {
      try {
        // Update local state first for better UX
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  available: Math.max(0, item.available - orderedQuantity),
                  inquiries: (item.inquiries || 0) + 1,
                }
              : item
          )
        );

        // Update backend
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: Math.max(0, selectedProduct.available - orderedQuantity),
            inquiries: (selectedProduct.inquiries || 0) + 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Close modal with setTimeout
        setTimeout(() => {
          setOrderModalVisible(false);
          setSelectedProduct(null);
        }, 0);

        Alert.alert("Success", "Your order has been placed successfully!");
      } catch (error) {
        console.error("Error processing order:", error);
        Alert.alert("Error", "Failed to process order. Please try again.");

        // Revert local state if API call fails
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  available: item.available + orderedQuantity,
                  inquiries: Math.max(0, (item.inquiries || 0) - 1),
                }
              : item
          )
        );
      }
    },
    [selectedProduct]
  );

  // Modal close handlers
  const handleModalClose = useCallback(() => {
    setTimeout(() => setModalVisible(false), 0);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setTimeout(() => {
      setEditModalVisible(false);
      setProductToEdit(null);
    }, 0);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Agricultural Market</Text>
        <TouchableOpacity style={styles.menuButton} onPress={refreshProducts}>
          <FontAwesome5
            name={refreshing ? "spinner" : "sync-alt"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshProducts}
              tintColor="#4CAF50"
            />
          }
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <FontAwesome5
                name="search"
                size={16}
                color="#8e8e8e"
                style={styles.iconLeft}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  isRecording
                    ? "Recording... Tap mic again to stop"
                    : "Search fresh produce. Say in English: 'tomato', 'potato', 'rice'"
                }
                placeholderTextColor="#bdbdbd"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                returnKeyType="search"
                editable={!isRecording && !isProcessingVoice}
                onSubmitEditing={() => {
                  // Handle text search if needed
                }}
              />

              {/* Voice Search Button - Simple Tap to Record/Stop */}
              <TouchableOpacity
                onPress={handleVoiceSearch}
                disabled={isProcessingVoice}
                style={[
                  styles.iconButton,
                  isRecording && styles.recordingButton,
                ]}
              >
                {isProcessingVoice ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : isRecording ? (
                  <View style={styles.recordingContainer}>
                    <FontAwesome5
                      name="stop-circle"
                      size={18}
                      color="#FF3B30"
                    />
                  </View>
                ) : (
                  <FontAwesome5 name="microphone" size={18} color="#4CAF50" />
                )}
              </TouchableOpacity>
            </View>

            {/* Recording Status */}
            {isRecording && (
              <View style={styles.recordingStatus}>
                <Text style={styles.recordingText}>
                  🔊 Recording... Tap mic again to stop
                </Text>
                <Text style={styles.recordingTimer}>
                  Speak crop names in English (e.g., "tomato", "potato", "rice")
                </Text>
              </View>
            )}

            {/* Voice Search Tips */}
            {!isRecording && !isProcessingVoice && searchMode === "voice" && (
              <View style={styles.voiceTips}>
                <Text style={styles.voiceTipsText}>
                  Tip: Say crop names in English like "tomato", "potato",
                  "rice", "banana"
                </Text>
              </View>
            )}
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
          >
            {filterOptions.map((label) => (
              <Chip
                key={label}
                label={label}
                active={selectedFilter === label}
                onPress={setSelectedFilter}
              />
            ))}
          </ScrollView>

          {/* My Active Listings - Static Data */}
          {user?.role === "farmer" && (
            <>
              <Text style={styles.sectionTitle}>My Active Listings</Text>
              <View style={styles.listingCard}>
                <View style={styles.listingIconContainer}>
                  <Image
                    source={require("../assets/images/tomato.jpg")}
                    style={styles.listingImage}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle}>
                    {staticActiveListing.name}
                  </Text>
                  <Text style={styles.listingSub}>
                    {staticActiveListing.price}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.activeStatus}>
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                    <Text style={styles.metaInfo}>
                      {staticActiveListing.views} views •{" "}
                      {staticActiveListing.inquiries} inquiries
                    </Text>
                  </View>
                </View>
              </View>

              {/* 🧺 Kalimati Market Price Table (Farmer Only) */}
              {user?.role === "farmer" && (
                <View style={styles.marketBox}>
                  <Text style={styles.marketTitle}>
                    Kalimati Market Prices (Today)
                  </Text>

                  {priceLoading ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : marketPrices.length === 0 ? (
                    <Text style={styles.marketEmpty}>
                      No market data available
                    </Text>
                  ) : (
                    <>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <View>
                          {/* Table Header */}
                          <View style={[styles.row, styles.headerRow]}>
                            <Text style={[styles.cell, styles.colCrop]}>
                              बाली
                            </Text>
                            <Text style={styles.cell}>न्यूनतम</Text>
                            <Text style={styles.cell}>अधिकतम</Text>
                            <Text style={styles.cell}>औसत</Text>
                          </View>

                          {/* Table Rows */}
                          {marketPrices
                            .slice(0, showAll ? marketPrices.length : 10)
                            .map((item, index) => (
                              <View key={item._id || index} style={styles.row}>
                                <Text style={[styles.cell, styles.colCrop]}>
                                  {item.commodity_np}
                                </Text>
                                <Text style={styles.cell}>
                                  रु {toNepaliNumber(item.min)}
                                </Text>
                                <Text style={styles.cell}>
                                  रु {toNepaliNumber(item.max)}
                                </Text>
                                <Text style={styles.cell}>
                                  रु {toNepaliNumber(item.avg)}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </ScrollView>

                      {/* Toggle Button */}
                      {marketPrices.length > 10 && (
                        <TouchableOpacity
                          onPress={() => setShowAll(!showAll)}
                          style={styles.toggleBtn}
                        >
                          <Text style={styles.toggleText}>
                            {showAll ? "सबै लुकाउनुहोस्" : "सबै हेर्नुहोस्"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}

              {/* List Your Product Button */}
              <TouchableOpacity
                style={styles.listProductBtn}
                onPress={() => setModalVisible(true)}
              >
                <FontAwesome5
                  name="plus"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.listProductText}>List Your Product</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Fresh Produce Available */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Fresh Produce Available</Text>
            <TouchableOpacity onPress={refreshProducts}>
              <Text style={styles.viewAll}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {sortedProducts.length > 0 ? (
            sortedProducts.map((item) => (
              <View
                style={[
                  styles.productCard,
                  item.isUserListed && styles.userListedCard,
                ]}
                key={item.id}
              >
                <View style={styles.productIconContainer}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={getCropImage(item.name)}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.productTitleRow}>
                    <Text style={styles.productTitle}>
                      {item.name || "Unknown Product"}
                    </Text>
                    {item.isUserListed && (
                      <Text style={styles.myProductTag}>My Product</Text>
                    )}
                  </View>
                  <Text style={styles.productSub}>
                    {item.desc || "No description"}
                  </Text>
                  <Text style={styles.productMeta}>
                    {item.price || "Price not available"} •{" "}
                    {item.available || 0} {item.unit || "units"} available
                  </Text>
                  {item.farmer_name && !item.isUserListed && (
                    <Text
                      style={[
                        styles.productSub,
                        { fontSize: 12, marginTop: 2 },
                      ]}
                    >
                      by {item.farmer_name}
                    </Text>
                  )}
                  <View style={styles.distanceRow}>
                    <FontAwesome5
                      name="map-marker-alt"
                      size={12}
                      color="#999"
                    />
                    <Text style={styles.distance}>
                      {item.distance || "Distance unknown"}
                    </Text>
                    {item.views > 0 && (
                      <>
                        <FontAwesome5
                          name="eye"
                          size={12}
                          color="#999"
                          style={{ marginLeft: 10 }}
                        />
                        <Text style={styles.distance}>{item.views} views</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    onPress={() => toggleHeart(item.id)}
                    style={styles.heartButton}
                  >
                    <FontAwesome5
                      name="heart"
                      size={18}
                      color={item.heart ? "#e74c3c" : "#ddd"}
                      solid={item.heart}
                    />
                  </TouchableOpacity>

                  {/* Show edit/delete buttons for user's own products */}
                  {item.isUserListed ? (
                    <View style={styles.ownerActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditProduct(item)}
                      >
                        <FontAwesome5 name="edit" size={16} color="#4CAF50" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteProduct(item.id, item.name)}
                      >
                        <FontAwesome5 name="trash" size={16} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.buyButton,
                        item.available <= 0 && styles.buyButtonDisabled,
                      ]}
                      onPress={() => onOrderPress(item)}
                      disabled={item.available <= 0}
                    >
                      <Text
                        style={[
                          styles.buyButtonText,
                          item.available <= 0 && styles.buyButtonTextDisabled,
                        ]}
                      >
                        {item.available <= 0 ? "Out of Stock" : "Buy Now"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome5 name="seedling" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>No products found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchText
                  ? `No products found for "${searchText}". Try voice search or adjust filters.`
                  : "No products available at the moment"}
              </Text>
              <TouchableOpacity
                style={[styles.listProductBtn, { marginTop: 16 }]}
                onPress={refreshProducts}
              >
                <FontAwesome5
                  name="sync-alt"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.listProductText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}

          <FavoriteFarmers title="Nearby Farmers" />

          {/* Recent Messages */}
          <Text style={styles.sectionTitle}>Recent Messages</Text>
          {messages.map((msg) => (
            <TouchableOpacity key={msg.id} style={styles.msgRow}>
              <View style={styles.avatarContainer}>
                <FontAwesome5 name="user" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.msgName}>{msg.name}</Text>
                <Text style={styles.msgTxt}>{msg.msg}</Text>
              </View>
              <View style={styles.msgTimeContainer}>
                <Text style={styles.msgTime}>{msg.time}</Text>
                <View style={styles.unreadIndicator} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

 
      {/* Modals */}
      <CropForm
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
      />

      <OrderProduct
        visible={orderModalVisible}
        onClose={onOrderClose}
        product={selectedProduct}
        onOrderSuccess={handleOrderSuccess}
      />

      <EditProductForm
        visible={editModalVisible}
        onClose={handleEditModalClose}
        product={productToEdit}
        onSubmit={handleEditFormSubmit}
      />
    </SafeAreaView>
  );
}

// Chip component
function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={() => onPress(label)}
    >
      <Text style={[styles.chipLabel, active && styles.chipActiveLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconLeft: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  iconButton: {
    padding: 8,
  },
  recordingButton: {
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginLeft: 4,
  },
  recordingStatus: {
    marginTop: 8,
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  recordingText: {
    color: "#FF3B30",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordingTimer: {
    color: "#666",
    fontSize: 11,
    textAlign: "center",
  },
  voiceTips: {
    marginTop: 6,
    paddingHorizontal: 8,
  },
  voiceTipsText: {
    color: "#666",
    fontSize: 11,
    fontStyle: "italic",
  },
  chipScroll: {
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
    alignSelf: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  chipActive: {
    backgroundColor: "#4CAF50",
    elevation: 2,
  },
  chipLabel: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  chipActiveLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  listingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  listingImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  listingSub: {
    color: "#666",
    marginBottom: 6,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeStatus: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  inactiveStatus: {
    backgroundColor: "#ffebee",
  },
  activeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  inactiveText: {
    color: "#f44336",
  },
  metaInfo: {
    fontSize: 12,
    color: "#999",
  },
  listProductBtn: {
    margin: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listProductText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  viewAll: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 16,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userListedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  productIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  productTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  productTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  myProductTag: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    textTransform: "uppercase",
  },
  productSub: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  productActions: {
    alignItems: "center",
  },
  heartButton: {
    padding: 8,
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buyButtonDisabled: {
    backgroundColor: "#ddd",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  buyButtonTextDisabled: {
    color: "#999",
  },
  ownerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#e8f5e8",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    minHeight: 36,
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    minHeight: 36,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  msgName: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 15,
    marginBottom: 2,
  },
  msgTxt: {
    color: "#666",
    fontSize: 14,
  },
  msgTimeContainer: {
    alignItems: "flex-end",
  },
  msgTime: {
    color: "#999",
    fontSize: 12,
    marginBottom: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  marketBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2e7d32",
  },
  marketEmpty: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  headerRow: {
    backgroundColor: "#f1f8f4",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: 90,
    fontSize: 12,
    color: "#333",
  },
  colCrop: {
    width: 200,
    fontWeight: "600",
  },
  toggleBtn: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: "#4CAF50",
    borderRadius: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
