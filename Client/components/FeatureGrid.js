import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function FeatureGrid({ items = [] }) {
  // ✅ default empty array
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const language = useSelector((state) => state.language.value);

  // Translate item titles
  const getTitle = (item) => {
    const translations = {
      "My Crops": language === "NP" ? "मेरो बाली" : "My Crops",
      "Crop Health": language === "NP" ? "बाली स्वास्थ्य" : "Crop Health",
      "Sell Produce": language === "NP" ? "बिक्री गर्नुहोस्" : "Sell Produce",
      "Rent Tools": language === "NP" ? "उपकरण भाडामा" : "Rent Tools",
      "Buy Produce": language === "NP" ? "किन्नुहोस्" : "Buy Produce",
      "My Purchases": language === "NP" ? "मेरो खरिद" : "My Purchases",
      Prebook: language === "NP" ? "अग्रिम बुक" : "Prebook",
    };
    return translations[item.title] || item.title;
  };

  // Handle navigation on press
  const handlePress = (title) => {
    switch (title) {
      case "My Crops":
        router.push("/my-crops");
        break;
      case "Crop Health":
        router.push("/crop-health");
        break;
      case "Sell Produce":
        router.push("/RentCrop");
        break;
      case "My Purchases":
        router.push("/RentCrop");
        break;
      case "Prebook":
        router.push("/prebooking");
        break;
      default:
        router.push("/RentMachine");
    }
  };

  // Add Prebook item dynamically if user role is "user"
  let displayItems = [...items];
  if (
    user?.role === "user" &&
    !displayItems.some((i) => i.title === "Prebook")
  ) {
    displayItems.push({
      id: "6",
      title: "Prebook",
      icon: "calendar-outline",
      bgColor: "#f3e5f5",
    });
  }

  // Filter items based on role
  const filteredItems = displayItems.filter((item) => {
    if (user?.role === "user") {
      return ["My Crops", "My Purchases", "Prebook"].includes(item.title);
    } else if (user?.role === "farmer") {
      return ["My Crops", "Crop Health", "Sell Produce", "Rent Tools"].includes(
        item.title
      );
    }
    return false;
  });

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {filteredItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: item.bgColor || "#fff" }]}
            onPress={() => handlePress(item.title)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.iconBgColor || "#333" },
              ]}
            >
              <Ionicons name={item.icon} size={24} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>{getTitle(item)}</Text>

            <View style={styles.arrow}>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (width - 56) / 2,
    height: 120,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 20,
    flex: 1,
  },
  arrow: {
    position: "absolute",
    bottom: 16,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
