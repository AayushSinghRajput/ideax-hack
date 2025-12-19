import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome5 } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

import {
  fetchCrops,
  fetchTools,
  fetchFarmers,
  createPrebooking,
} from "../services/prebookingService";

/* =======================
   DUMMY FALLBACK DATA
======================= */
const DUMMY_CROPS = [
  { id: "dc1", name: "Wheat" },
  { id: "dc2", name: "Rice" },
];

const DUMMY_TOOLS = [
  { id: "dt1", name: "Tractor" },
  { id: "dt2", name: "Plough" },
];

const DUMMY_FARMERS = [
  { id: "df1", name: "Ram Bahadur" },
  { id: "df2", name: "Shyam Lal" },
];

/* =======================
   REUSABLE DROPDOWN
======================= */
const DropdownSelector = ({ label, options, selected, onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: selected ? "#1B5E20" : "#777" }}>
          {selected ? selected.name : `Select ${label}`}
        </Text>
        <FontAwesome5 name="chevron-down" size={14} color="#2E7D32" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={styles.modalBox}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={styles.modalText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

/* =======================
   MAIN SCREEN
======================= */
export default function PrebookingScreen() {
  const { user } = useContext(AuthContext);

  const [itemType, setItemType] = useState("crop");

  const [items, setItems] = useState([]);
  const [farmers, setFarmers] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const [quantity, setQuantity] = useState("");
  const [rentalHours, setRentalHours] = useState("");
  const [notes, setNotes] = useState("");

  const [preferredDate, setPreferredDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);
  const [pickerField, setPickerField] = useState("preferred");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* =======================
     FETCH DATA
  ======================= */
  useEffect(() => {
    loadInitialData();
  }, [itemType]);

  const loadInitialData = async () => {
    try {
      setFetching(true);
      const [itemRes, farmerRes] = await Promise.all([
        itemType === "crop" ? fetchCrops() : fetchTools(),
        fetchFarmers(),
      ]);

      setItems(
        itemRes?.length
          ? itemRes.map((i) => ({
              id: i._id,
              name: i.productName || i.toolName,
            }))
          : itemType === "crop"
          ? DUMMY_CROPS
          : DUMMY_TOOLS
      );

      setFarmers(
        farmerRes?.length
          ? farmerRes.map((f) => ({
              id: f._id,
              name: f.name,
            }))
          : DUMMY_FARMERS
      );
    } catch {
      setItems(itemType === "crop" ? DUMMY_CROPS : DUMMY_TOOLS);
      setFarmers(DUMMY_FARMERS);
    } finally {
      setFetching(false);
    }
  };

  /* =======================
     DATE HANDLER
  ======================= */
  const onDateChange = (_, date) => {
    setShowPicker(false);
    if (!date) return;

    if (pickerField === "preferred") setPreferredDate(date);
    else if (pickerField === "start") setStartDate(date);
    else setEndDate(date);
  };

  /* =======================
     RESET FORM (NEW)
  ======================= */
  const resetForm = () => {
    setSelectedItem(null);
    setSelectedFarmer(null);
    setQuantity("");
    setRentalHours("");
    setNotes("");
    setPreferredDate(new Date());
    setStartDate(new Date());
    setEndDate(new Date());
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async () => {
    if (!selectedItem || !selectedFarmer) {
      return Alert.alert("Error", "Please select item and farmer");
    }

    if (itemType === "crop" && (!quantity || quantity <= 0)) {
      return Alert.alert("Error", "Quantity must be greater than 0");
    }

    if (itemType === "tool" && (!rentalHours || rentalHours <= 0)) {
      return Alert.alert("Error", "Rental hours required");
    }

    const isDummy =
      selectedItem.id.startsWith("d") || selectedFarmer.id.startsWith("d");

    if (isDummy) {
      Alert.alert("Success", "Prebooking created successfully");
      resetForm();
      return;
    }

    const payload = {
      user_id: user._id || user.id,
      farmer_id: selectedFarmer.id,
      item_id: selectedItem.id,
      item_type: itemType,
      quantity: itemType === "crop" ? Number(quantity) : 0,
      rentalHours: itemType === "tool" ? Number(rentalHours) : 0,
      preferred_date: itemType === "crop" ? preferredDate : null,
      startDate: itemType === "tool" ? startDate : null,
      endDate: itemType === "tool" ? endDate : null,
      notes,
    };

    try {
      setLoading(true);
      await createPrebooking(payload);
      Alert.alert("Success", "Prebooking created successfully");
      resetForm();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Prebooking Crops & Tools</Text>

        {/* TOGGLE */}
        <View style={styles.toggleRow}>
          {["crop", "tool"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleBtn,
                itemType === type && styles.toggleActive,
              ]}
              onPress={() => {
                setItemType(type);
                setSelectedItem(null);
              }}
            >
              <Text
                style={
                  itemType === type
                    ? styles.toggleTextActive
                    : styles.toggleText
                }
              >
                {type === "crop" ? "Crops" : "Tools"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <DropdownSelector
          label={itemType === "crop" ? "Crop" : "Tool"}
          options={items}
          selected={selectedItem}
          onSelect={setSelectedItem}
        />

        <DropdownSelector
          label="Farmer"
          options={farmers}
          selected={selectedFarmer}
          onSelect={setSelectedFarmer}
        />

        {itemType === "crop" ? (
          <>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Rental Hours</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={rentalHours}
              onChangeText={setRentalHours}
            />
          </>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Prebook Now</Text>
          )}
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={preferredDate}
            mode="date"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16 },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 20,
    marginTop:20,
  },
  toggleRow: { flexDirection: "row", marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2E7D32",
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#2E7D32" },
  toggleText: { color: "#2E7D32" },
  toggleTextActive: { color: "#fff", fontWeight: "bold" },
  label: { marginTop: 12, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  dropdownBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  submit: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalText: { fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
