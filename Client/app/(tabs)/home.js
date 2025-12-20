import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeatureGrid from "../../components/FeatureGrid";
import GreetingCard from "../../components/GreetingCard";
import HomeHeader from "../../components/HomeHeader";
import OfflineAlert from "../../components/OfflineAlert";
import TipCard from "../../components/TipCard";
import WeatherCard from "../../components/WeatherCard";
import FAQSection from "../../components/Question";
import {
  farmingTips,
  featureGridItems,
  weatherInfo,
  faqData,
} from "../../constants/data";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import FavoriteFarmers from "../../components/FavoriteFarmers";
import RecentlyBrought from "../../components/RecentlyBrought";

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["right", "left"]}
    >
      <View style={{ flex: 1 }}>
        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 90, paddingBottom: 20 }}
        >
          <GreetingCard />
          <OfflineAlert />
          <FeatureGrid items={featureGridItems} />
          {user?.role === "user" && <RecentlyBrought />}
          <WeatherCard weather={weatherInfo} />
          {user?.role === "user" && <FavoriteFarmers />}
          {user?.role === "farmer" && <TipCard tips={farmingTips} />}
          <FAQSection faqData={faqData} />
        </ScrollView>
        {/* Absolutely Positioned Header */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "#fff",
          }}
        >
          <HomeHeader />
        </View>
      </View>
    </SafeAreaView>
  );
}
