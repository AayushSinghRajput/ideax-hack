import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import { loginUser } from "../../services/authService";

export default function Login() {
  const router = useRouter();
  const { signIn } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { status, data } = await loginUser(
        formData.email,
        formData.password
      );

      if (status >= 200 && status < 300) {
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${data.user?.name || "User"}!`,
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });

        const token = data.token || data.authToken || data.accessToken;
        if (!token) throw new Error("No authentication token received");

        await signIn(token, data.user);
        router.replace("/(tabs)/home");
      } else {
        if (status === 401)
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: "Invalid email or password.",
          });
        else if (status === 404)
          Toast.show({
            type: "error",
            text1: "Account Not Found",
            text2: "No account Found with this email.",
          });
        else if (status === 403)
          Toast.show({
            type: "error",
            text1: "Account Disabled",
            text2: "Your account has been disabled. Please Contact Support.",
          });
        else
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: data.message || "An error occured.",
          });
      }
    } catch (error) {
      console.error("Login error details:", error);
      if (
        error.message.includes("Network request failed") ||
        error.message.includes("fetch")
      ) {
        Toast.show({
          type: "error",
          text1: "Connection Error",
          text2:
            "Unable to connect to the server. Please check your connection and server status.",
        });
      } else if (error.message.includes("JSON")) {
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: "Server returned invalid response. Please try again.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: error.message || "Something went wrong.",
        });
        Alert.alert("Login Error", error.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      Alert.alert("Email Required", "Please enter your email address first.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be implemented soon. Please contact support for assistance.",
      [{ text: "OK" }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              style={[styles.input, errors.email && styles.inputError]}
              maxLength={100}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                errors.password && styles.inputError,
              ]}
            >
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!passwordVisible}
                autoComplete="password"
                value={formData.password}
                onChangeText={(value) => updateFormData("password", value)}
                style={styles.passwordInput}
                maxLength={50}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setPasswordVisible(!passwordVisible)}
                activeOpacity={0.7}
              >
                <Text style={styles.visibilityText}>
                  {passwordVisible ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/Register")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Create New Account</Text>
          </TouchableOpacity>

          <View style={styles.footerLinks}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "white",
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e8f5e9",
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#1a202c",
    borderWidth: 1,
    borderColor: "#e8f5e9",
  },
  inputError: {
    borderColor: "#e74c3c",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8f5e9",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a202c",
  },
  visibilityToggle: {
    padding: 12,
    paddingRight: 16,
  },
  visibilityText: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#388E3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e8f5e9",
  },
  dividerText: {
    paddingHorizontal: 12,
    color: "#6c757d",
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f8fffe",
    minHeight: 52,
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 16,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingTop: 20,
  },
  footerLinkText: {
    color: "#6c757d",
    fontSize: 12,
    fontWeight: "500",
  },
  footerDivider: {
    color: "#6c757d",
    fontSize: 12,
    marginHorizontal: 8,
  },
});
