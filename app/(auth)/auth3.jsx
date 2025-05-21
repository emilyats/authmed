import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ResetPassScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const router = useRouter();
  const auth = FIREBASE_AUTH;

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      return false;
    } else {
      setEmailError(false);
      return true;
    }
  };

  const handleReset = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Reset Email Sent",
        "We've sent a password reset link to your email. Please check your inbox.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error sending reset email:', error);

      let errorMessage = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      Alert.alert("Reset Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <View style={styles.mainContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <AntDesign name="arrowleft" size={24} color="#35383F" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.formWrapper}>
            <Text style={styles.headerText}>Reset Password</Text>

            <View style={styles.labelRow}>
              <Text style={styles.labelText}>Your Email</Text>
              {emailError && <Text style={styles.errorText}>*Enter a valid email</Text>}
            </View>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (text.trim()) setEmailError(false);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.infoText}>
              We'll send a password reset link to your email address.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 20,
    marginTop: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    color: '#35383F',
    marginLeft: 8,
  },
  formWrapper: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 30,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginBottom: 20,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 12,
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
    paddingLeft: 8
  },
  errorText: {
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    color: 'red',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#35383F',
    borderRadius: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  inputError: {
    borderColor: 'red',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  resetButton: {
    backgroundColor: '#145185',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
