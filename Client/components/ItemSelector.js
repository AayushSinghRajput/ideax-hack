import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function ItemSelector({
  itemType,
  selectedItem,
  setSelectedItem,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/products?type=${itemType}`
        );

        // Ensure items is always an array
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.products)) {
          // If API wraps items inside "products"
          data = response.data.products;
        }
        setItems(data);
      } catch (error) {
        console.error(
          "Error fetching items:",
          error.response?.data || error.message
        );
        setItems([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [itemType]);

  if (loading)
    return <ActivityIndicator color="#4CAF50" style={{ marginVertical: 10 }} />;

  if (!items || items.length === 0)
    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={{ color: "#666" }}>No items available.</Text>
      </View>
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 8 }}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item._id || item.id}
          style={[
            styles.itemCard,
            selectedItem?._id === item._id && styles.itemCardSelected,
          ]}
          onPress={() => setSelectedItem(item)}
        >
          <Text
            style={
              selectedItem?._id === item._id
                ? styles.itemTextSelected
                : styles.itemText
            }
          >
            {item.productName || item.name || "Unnamed Item"}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  itemCardSelected: { backgroundColor: "#4CAF50" },
  itemText: { color: "#4CAF50", fontWeight: "600" },
  itemTextSelected: { color: "#fff", fontWeight: "600" },
});
