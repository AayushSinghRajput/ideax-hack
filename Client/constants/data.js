// constants/data.js

export const greetingUser = {
  name: "Ram Bahadur",
  tip: "Today is a good day for farming",
};

export const featureGridItems = [
  { id: "1", title: "My Crops", icon: "leaf-outline", bgColor: "#e8f5e9" },
  { id: "2", title: "Crop Health", icon: "medkit-outline", bgColor: "#fde0dc" },
  { id: "3", title: "Sell Produce", icon: "cart-outline", bgColor: "#fff3e0" },
  { id: "4", title: "Rent Tools", icon: "construct-outline", bgColor: "#e3f2fd" },
  { id: "5", title: "My Purchases", icon: "basket-outline", bgColor: "#f3e5f5" },
  { id: "6", title: "Prebook", icon: "calendar-outline", bgColor: "#f3e5f5" }, // ✅ Prebook
];


export const farmingTips = [
  {
    id: "1",
    title: "Best practices for tomato cultivation",
    titleNP: "टमाटर खेतीका लागि उत्तम अभ्यासहरू",
    description:
      "Learn how to maximize your tomato yield with these expert tips",
    descriptionNP:
      "यी विशेषज्ञ सुझावहरूले तपाईंको टमाटरको उत्पादन कसरी बढाउने भन्ने कुरा सिक्नुहोस्",
    date: "2 days ago",
    dateNP: "२ दिन अघि",
    category: "Vegetables",
    categoryNP: "तरकारी",
  },
  {
    id: "2",
    title: "Monsoon preparation for your crops",
    titleNP: "तपाईंका बालीहरूका लागि मनसुन तयारी",
    description: "Protect your farm with these monsoon-ready techniques",
    descriptionNP:
      "यी मनसुन-तयार प्रविधिहरूले तपाईंको खेतलाई सुरक्षित राख्नुहोस्",
    date: "5 days ago",
    dateNP: "५ दिन अघि",
    category: "Weather Management",
    categoryNP: "मौसम व्यवस्थापन",
  },
];

export const faqData = [
  {
    question: {
      nepali: "स्मार्ट कृषि के हो?",
      english: "What is Smart Krishi?",
    },
    answer: {
      nepali:
        "स्मार्ट कृषि एक डिजिटल प्लेटफर्म हो जसले किसानहरूलाई आधुनिक खेती गर्न मद्दत गर्छ। यसमा मौसम जानकारी, बाली निगरानी, र कृषि सल्लाह समावेश छ।",
      english:
        "Smart Krishi is a digital platform that helps farmers with modern farming techniques, including weather information, crop monitoring, and agricultural advice.",
    },
  },
  {
    question: {
      nepali: "बाली जीवन चक्र निगरानी कसरी काम गर्छ?",
      english: "How does crop lifecycle monitoring work?",
    },
    answer: {
      nepali:
        "हाम्रो एप्पले तपाईंको बालीको बीउ छर्ने देखि काट्ने सम्मको सम्पूर्ण यात्रा ट्र्याक गर्छ। यसले बाली बृद्धिको चरणहरू, आवश्यक हेरचाह, र सही समयमा कुन काम गर्ने भन्ने जानकारी दिन्छ।",
      english:
        "Our app tracks your crop's complete journey from sowing to harvesting, providing growth stage information, care requirements, and timely farming activities.",
    },
  },
  {
    question: {
      nepali: "नेपाली भाषा सपोर्ट छ?",
      english: "Is Nepali language supported?",
    },
    answer: {
      nepali:
        "हो, हाम्रो एप्प पूर्ण रूपमा नेपाली भाषामा उपलब्ध छ। सबै फिचरहरू, निर्देशनहरू, र जानकारी नेपालीमा पाउन सकिन्छ। तपाईं सेटिङमा गएर भाषा परिवर्तन गर्न सक्नुहुन्छ।",
      english:
        "Yes, our app is fully available in Nepali language. All features, instructions, and information are available in Nepali. You can change the language in settings.",
    },
  },
  {
    question: {
      nepali: "मौसम पूर्वानुमान कत्ति सही छ?",
      english: "How accurate is the weather forecast?",
    },
    answer: {
      nepali:
        "हामी विश्वसनीय मौसम डाटा प्रदायकहरूसँग काम गर्छौं र स्थानीय मौसम स्टेशनहरूबाट जानकारी लिन्छौं। सामान्यतया ३-५ दिनको पूर्वानुमान ८५-९०% सही हुन्छ।",
      english:
        "We work with reliable weather data providers and local weather stations. Generally, 3-5 day forecasts are 85-90% accurate.",
    },
  },
  {
    question: {
      nepali: "अफलाइन मोडमा एप्प काम गर्छ?",
      english: "Does the app work in offline mode?",
    },
    answer: {
      nepali:
        "केही फिचरहरू अफलाइन उपलब्ध छन् जस्तै पहिले सेभ गरिएको डाटा, कृषि टिप्स, र बाली क्यालेन्डर। तर मौसम अपडेट र रियल-टाइम सल्लाहको लागि इन्टरनेट आवश्यक छ।",
      english:
        "Some features are available offline like previously saved data, farming tips, and crop calendar. However, internet is required for weather updates and real-time advice.",
    },
  },
  {
    question: {
      nepali: "एप्प प्रयोग गर्न शुल्क लाग्छ?",
      english: "Is there a fee to use the app?",
    },
    answer: {
      nepali:
        "आधारभूत फिचरहरू नि:शुल्क छन्। प्रिमियम फिचरहरू जस्तै विस्तृत बाली विश्लेषण र व्यक्तिगत सल्लाहको लागि मासिक सदस्यता शुल्क छ।",
      english:
        "Basic features are free. Premium features like detailed crop analysis and personalized advice require a monthly subscription.",
    },
  },
  {
    question: {
      nepali: "कुन कुन बालीहरूको जानकारी पाइन्छ?",
      english: "Which crops information is available?",
    },
    answer: {
      nepali:
        "धान, गहूं, मकै, आलु, तरकारी, फलफूल लगायत नेपालका मुख्य बालीहरूको विस्तृत जानकारी उपलब्ध छ। नयाँ बालीहरू नियमित रूपमा थपिंदैछन्।",
      english:
        "Information for major Nepali crops including rice, wheat, corn, potato, vegetables, and fruits is available. New crops are regularly being added.",
    },
  },
  {
    question: {
      nepali: "डाटा सुरक्षित छ?",
      english: "Is my data secure?",
    },
    answer: {
      nepali:
        "हो, तपाईंको व्यक्तिगत जानकारी र खेती डाटा पूर्ण रूपमा सुरक्षित छ। हामी कडा डाटा सुरक्षा नीति पालना गर्छौं र तेस्रो पक्षसँग जानकारी साझा गर्दैनौं।",
      english:
        "Yes, your personal information and farming data is completely secure. We follow strict data security policies and don't share information with third parties.",
    },
  },
  {
    question: {
      nepali: "स्मार्ट कृषिका मुख्य फिचरहरू के के छन्?",
      english: "What are the main features of Smart Krishi?",
    },
    answer: {
      nepali:
        "मुख्य फिचरहरूमा बाली निगरानी, मौसम पूर्वानुमान, कृषि सल्लाह, रोग पहिचान, बजार मूल्य जानकारी, र किसान समुदाय नेटवर्क समावेश छ।",
      english:
        "Main features include crop monitoring, weather forecast, agricultural advice, disease identification, market price information, and farmer community network.",
    },
  },
  {
    question: {
      nepali: "नयाँ किसानहरूका लागि कस्तो सहायता छ?",
      english: "What support is available for new farmers?",
    },
    answer: {
      nepali:
        "नयाँ किसानहरूका लागि विशेष ट्यूटोरियल, चरणबद्ध गाइड, र विशेषज्ञ सल्लाह उपलब्ध छ। साथै २४/७ हेल्पलाइन सेवा पनि छ।",
      english:
        "Special tutorials, step-by-step guides, and expert advice are available for new farmers. Additionally, there's a 24/7 helpline service.",
    },
  },
];

export const marketProducts = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    price: "Rs. 120/kg",
    image: "https://via.placeholder.com/80",
  },
  {
    id: "2",
    name: "Organic Rice",
    price: "Rs. 85/kg",
    image: "https://via.placeholder.com/80",
  },
  {
    id: "3",
    name: "Onions",
    price: "Rs. 65/kg",
    image: "https://via.placeholder.com/80",
  },
];

export const alertsList = [
  {
    id: "1",
    title: "Pest Alert: Aphids in Tomatoes",
    titleNP: "कीरा चेतावनी: टमाटरमा एपिड्स",
    description:
      "Aphid infestation detected in tomato crops. Farmers are advised to take immediate pest control measures.",
    descriptionNP:
      "टमाटरको बालीमा एपिड्स पत्ता लाग्यो। कृषकहरूले तुरुन्तै कीरा नियन्त्रण उपायहरू लिन सिफारिस गरिन्छ।",
    time: "2h ago",
    icon: "bug-outline",
  },
  {
    id: "2",
    title: "Heavy Rain Warning",
    titleNP: "भारी वर्षा चेतावनी",
    description:
      "Meteorological department predicts heavy rainfall in the next 24 hours. Take precautions to protect crops and property.",
    descriptionNP:
      "मौसम विभागले आगामी २४ घण्टामा भारी वर्षाको पूर्वानुमान गरेको छ। बाली र सम्पत्ति सुरक्षित गर्न सावधानी अपनाउनुहोस्।",
    time: "6h ago",
    icon: "rainy-outline",
  },
  {
    id: "3",
    title: "Fertilizer Shortage Update",
    titleNP: "प्रवाहकीय मल अभाव अपडेट",
    description:
      "Certain fertilizers are running low in local markets. Plan your crop fertilization accordingly.",
    descriptionNP:
      "केही मलहरू स्थानीय बजारमा कम छन्। आफ्नो बाली मलाइकरण योजना अनुसार गर्नुहोस्।",
    time: "1d ago",
    icon: "leaf-outline",
  },
  {
    id: "4",
    title: "Soil Moisture Level Low",
    titleNP: "माटोको नमी स्तर कम",
    description:
      "Soil moisture levels are below optimal. Irrigation is recommended to prevent crop stress.",
    descriptionNP:
      "माटोको नमी स्तर सामान्य भन्दा कम छ। बालीमा तनाव रोक्न सिँचाइ सिफारिस गरिन्छ।",
    time: "3h ago",
    icon: "water-outline",
  },
  {
    id: "5",
    title: "Harvest Season Starting Soon",
    titleNP: "फलफूल/बाली काट्ने मौसम छिट्टै सुरु हुँदैछ",
    description:
      "The harvest season is approaching. Prepare storage and transport for your crops.",
    descriptionNP:
      "फलफूल/बाली काट्ने मौसम नजिकै छ। आफ्नो बालीको भण्डारण र ढुवानी तयारी गर्नुहोस्।",
    time: "5d ago",
    icon: "calendar-outline",
  },
  {
    id: "6",
    title: "Livestock Vaccination Reminder",
    titleNP: "पाल्तु जनावरको खोप सम्झना",
    description:
      "Scheduled vaccinations for cattle and poultry are due. Ensure timely inoculation to prevent diseases.",
    descriptionNP:
      "गाई, कुखुरा र अन्य पाल्तु जनावरहरूको खोप समयमै गर्नुहोस्। रोग रोकथामका लागि आवश्यक छ।",
    time: "4h ago",
    icon: "medkit-outline",
  },
  {
    id: "7",
    title: "Drought Alert for Dry Zones",
    titleNP: "सूखा चेतावनी: शुष्क क्षेत्रहरू",
    description:
      "Water levels in reservoirs are critically low. Farmers should plan irrigation carefully.",
    descriptionNP:
      "जलाशयमा पानीको स्तर निकै कम छ। कृषकहरूले सिँचाइ योजना सावधानीपूर्वक गर्नुहोस्।",
    time: "12h ago",
    icon: "water-outline",
  },
  {
    id: "8",
    title: "Crop Disease: Blight in Potatoes",
    titleNP: "बाली रोग: आलुमा ब्लाइट",
    description:
      "Potato crops affected by late blight. Remove infected plants and treat the rest promptly.",
    descriptionNP:
      "आलु बालीमा लेट ब्लाइट रोग देखिएको छ। संक्रमित बोटहरू हटाउनुहोस् र बाँकी बाली उपचार गर्नुहोस्।",
    time: "6h ago",
    icon: "bug-outline",
  },
  {
    id: "9",
    title: "Poultry Feed Shortage",
    titleNP: "कुखुरा खाध्य पदार्थ अभाव",
    description:
      "Local markets report shortage of poultry feed. Plan feeding schedules carefully.",
    descriptionNP:
      "स्थानीय बजारमा कुखुरा खाध्य पदार्थ कम भएको छ। खाने तालिका सावधानीपूर्वक बनाउनुहोस्।",
    time: "2d ago",
    icon: "egg-outline",
  },
  {
    id: "10",
    title: "Fertilizer Quality Alert",
    titleNP: "मलको गुणस्तर चेतावनी",
    description:
      "Some batches of fertilizer found below quality standards. Verify before use.",
    descriptionNP:
      "केही मलको ब्याच गुणस्तरमा कम भएको पत्ता लाग्यो। प्रयोग अघि जाँच गर्नुहोस्।",
    time: "1d ago",
    icon: "leaf-outline",
  },
];

export const profileInfo = {
  name: "Kriti Sanon",
  avatar: require("../assets/images/profile.jpg"),
};

export const profileOptions = [
  { id: "1", label: "My Crops", icon: "leaf" },
  { id: "2", label: "Crop Health", icon: "leaf-outline" },
  { id: "3", label: "My Orders", icon: "cart" },
  { id: "4", label: "News", icon: "newspaper-outline" },
  { id: "5", label: "Notifications", icon: "notifications" },
  { id: "6", label: "Billing & Payments", icon: "card" },
  { id: "7", label: "Settings", icon: "settings" },
  { id: "8", label: "Help & Support", icon: "help-circle" },
  { id: "9", label: "Logout", icon: "log-out" },
];

// constants/data.js

export const cropList = [
  {
    id: "1",
    name: "Rice",
    image: require("../assets/crops/rice.jpg"),
  },
  {
    id: "2",
    name: "Wheat",
    image: require("../assets/crops/wheat.jpg"),
  },
  {
    id: "3",
    name: "Maize",
    image: require("../assets/crops/maize.jpg"),
  },
  {
    id: "4",
    name: "Potato",
    image: require("../assets/crops/potato.jpg"),
  },
  {
    id: "5",
    name: "Onion",
    image: require("../assets/crops/onion.jpg"),
  },
];

export const smartKrishiFAQs = [
  {
    question: "What is SmartKrishi?",
    answer:
      "SmartKrishi is a digital platform designed to assist farmers by providing agricultural information, weather forecasts, crop management tips, and market prices through a user-friendly mobile app or website.",
  },
  {
    question: "How can SmartKrishi help improve my farming practices?",
    answer:
      "SmartKrishi provides tailored advice on crop selection, pest control, fertilizer usage, irrigation scheduling, and market trends, helping farmers make informed decisions for better yield and profit.",
  },
  {
    question: "Does SmartKrishi work offline?",
    answer:
      "Some features of SmartKrishi, like saved crop guides and past weather data, are available offline. However, real-time updates such as weather forecasts and market prices require an internet connection.",
  },
  {
    question: "Is SmartKrishi available in local languages?",
    answer:
      "Yes, SmartKrishi supports multiple local languages to make it easier for farmers from different regions to access and understand the information.",
  },
  {
    question: "How do I get started with SmartKrishi?",
    answer:
      "You can download the SmartKrishi app from the Google Play Store or visit the official website. After creating an account, you can set your crop preferences and start receiving customized tips and updates.",
  },
];

export const FavoriteFarmer = [
  {
    name: "Ramesh Yadav",
    location: "1.2 km",
    contact: "+91 9876543210",
    image: require("../assets/images/farmer.jpg"),
  },
  {
    name: "Nirmal Thapa",
    location: "2.8 km",
    contact: "+91 9123456780",
    image: require("../assets/images/farmer.jpg"),
  },
  {
    name: "Mohammad Irfan",
    location: "3.1 km",
    contact: "+91 9988776655",
    image: require("../assets/images/farmer.jpg"),
  },
  {
    name: "Hari Prasad Acharya",
    location: "0.9 km",
    contact: "+91 8877665544",
    image: require("../assets/images/farmer.jpg"),
  },
  {
    name: "Aeron Panta",
    location: "4.5 km",
    contact: "+91 7766554433",
    image: require("../assets/images/farmer.jpg"),
  },
];

export const cropPurchases = [
  {
    image: require("../assets/crops/wheat.jpg"),
    name: "Wheat",
    quantity: "50 kg",
    personName: "Ramesh Yadav",
    status: "Delivered",
    totalAmount: "₹2000",
  },
  {
    image: require("../assets/crops/rice.jpg"),
    name: "Rice",
    quantity: "100 kg",
    personName: "Sita Kumari",
    status: "Pending",
    totalAmount: "₹4500",
  },
  {
    image: require("../assets/crops/onion.jpg"),
    name: "Onion",
    quantity: "30 kg",
    personName: "Ajay Singh",
    status: "Delivered",
    totalAmount: "₹1500",
  },
  {
    image: require("../assets/crops/potato.jpg"),
    name: "Potato",
    quantity: "40 kg",
    personName: "Kavita Sharma",
    status: "Cancelled",
    totalAmount: "₹3200",
  },
  {
    image: require("../assets/crops/maize.jpg"),
    name: "Maize",
    quantity: "25 kg",
    personName: "Deepak Patel",
    status: "Delivered",
    totalAmount: "₹1800",
  },
];

export const purchasedCrops = [
  {
    id: 1,
    image: require("../assets/crops/wheat.jpg"),
    name: "Wheat",
    quantity: "100 kg",
    broughtFrom: "Rajesh Thapa",
    status: "Delivered",
    totalAmount: "Rs. 5,000",
  },
  {
    id: 2,
    image: require("../assets/crops/potato.jpg"),
    name: "Potatoes",
    quantity: "50 kg",
    broughtFrom: "Anjali Singh",
    status: "In Transit",
    totalAmount: "Rs. 2,500",
  },
  {
    id: 3,
    image: require("../assets/crops/rice.jpg"),
    name: "Rice",
    quantity: "120 kg",
    broughtFrom: "Kamal Yadav",
    status: "Delivered",
    totalAmount: "Rs. 6,000",
  },
];
