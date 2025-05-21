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
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form validation states
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const auth = FIREBASE_AUTH;
  
  const validateInputs = () => {
    let isValid = true;
    
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }
    
    // Check password (at least 6 characters)
    if (!password.trim() || password.length < 6) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      isValid = false;
    } else {
      setConfirmPasswordError(false);
    }
    
    return isValid;
  };
  
  const handleSignUp = async () => {
    if (!validateInputs()) {
      return;
    }
  
    setLoading(true);
    try {
      // Create user
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
  
      // Send verification email
      await sendEmailVerification(user);
      
      // Set first-time user flag
      await AsyncStorage.setItem('isFirstTimeUser', 'true');
  
      // Sign out user immediately
      await auth.signOut();
  
      console.log('User created and verification sent:', user);
      Alert.alert(
        "Verification Email Sent",
        "Please verify your email before logging in.",
        [
          { text: "OK", onPress: () => router.replace('/auth1') }
        ]
      );
    } catch (error) {
      console.error('Error during sign up:', error);
  
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use by another account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
  
      Alert.alert("Sign Up Failed", errorMessage);
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
          <Text style={styles.headerText}>Let's get started!</Text>
          
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>Email</Text>
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
          
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>Password</Text>
            {passwordError && <Text style={styles.errorText}>*Min. 6 characters</Text>}
          </View>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              secureTextEntry={!showPassword}
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text.trim() && text.length >= 6) setPasswordError(false);
                if (text === confirmPassword) setConfirmPasswordError(false);
              }}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 14, top: 14 }}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#35383F" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>Confirm Password</Text>
            {confirmPasswordError && <Text style={styles.errorText}>*Passwords don't match</Text>}
          </View>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, confirmPasswordError && styles.inputError]}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (text === password) setConfirmPasswordError(false);
              }}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 14, top: 14 }}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            >
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#35383F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 12,
    marginLeft: 8,
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
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
  signUpButton: {
    backgroundColor: '#145185',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});