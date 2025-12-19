// components/EditProductForm.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

export default function EditProductForm({
  visible,
  onClose,
  product,
  onSubmit,
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.desc,
        price: product.price.replace(/[^0-9.]/g, ""),
        quantity: product.available.toString(),
        unit: product.unit,
        location: product.location,
        delivery_home: product.deliveryHome,
        delivery_pickup: product.deliveryPickup,
      });
    }
  }, [product]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.quantity) {
      Alert.alert("Please fill in required fields");
      return;
    }
    onSubmit({ ...formData });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.title}>Edit Product</Text>

            <TextInput
              placeholder="Product Name"
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
            />
            <TextInput
              placeholder="Description"
              style={styles.input}
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
            />
            <TextInput
              placeholder="Price"
              style={styles.input}
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => handleChange("price", text)}
            />
            <TextInput
              placeholder="Quantity"
              style={styles.input}
              keyboardType="numeric"
              value={formData.quantity}
              onChangeText={(text) => handleChange("quantity", text)}
            />
            <TextInput
              placeholder="Unit (e.g., kg, dozen)"
              style={styles.input}
              value={formData.unit}
              onChangeText={(text) => handleChange("unit", text)}
            />
            <TextInput
              placeholder="Location"
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleChange("location", text)}
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 10,
    marginRight: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    marginLeft: 5,
    marginRight: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
