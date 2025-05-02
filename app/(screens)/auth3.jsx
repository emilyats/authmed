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
import { 
  sendPasswordResetEmail, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth';

export default function ResetPassScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form validation states
  const [emailError, setEmailError] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  
  // Reset type state (simple email reset vs full password change)
  const [resetType, setResetType] = useState('simple'); // 'simple' or 'full'
  
  const router = useRouter();
  const auth = FIREBASE_AUTH;
  
  const validateSimpleReset = () => {
    // Just validate email for simple reset
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      return false;
    } else {
      setEmailError(false);
      return true;
    }
  };
  
  const validateFullReset = () => {
    let isValid = true;
    
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }
    
    // Check current password
    if (!currentPassword.trim()) {
      setCurrentPasswordError(true);
      isValid = false;
    } else {
      setCurrentPasswordError(false);
    }
    
    // Check if new password is valid (min 6 chars)
    if (!newPassword.trim() || newPassword.length < 6) {
      setNewPasswordError(true);
      isValid = false;
    } else {
      setNewPasswordError(false);
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(true);
      isValid = false;
    } else {
      setConfirmPasswordError(false);
    }
    
    return isValid;
  };
  
  const handleSimpleReset = async () => {
    if (!validateSimpleReset()) {
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Reset Email Sent",
        "We've sent a password reset link to your email. Please check your inbox.",
        [
          { text: "OK", onPress: () => router.back() }
        ]
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
  
  const handleFullReset = async () => {
    if (!validateFullReset()) {
      return;
    }
    
    setLoading(true);
    try {
      // Check if user is logged in
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to change your password this way.");
        setLoading(false);
        return;
      }
      
      // Re-authenticate user first (required for security-sensitive operations)
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      Alert.alert(
        "Password Updated",
        "Your password has been successfully updated.",
        [
          { text: "OK", onPress: () => router.replace('/home') }
        ]
      );
    } catch (error) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/user-mismatch') {
        errorMessage = 'Email does not match the current user.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak. It should be at least 6 characters.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'This operation is sensitive and requires recent authentication. Please log in again.';
      }
      
      Alert.alert("Update Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    // Determine which reset function to call based on inputs
    if (currentPassword && newPassword && confirmPassword) {
      // Full reset (changing password)
      handleFullReset();
    } else {
      // Simple reset (email reset link)
      handleSimpleReset();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  const toggleResetType = () => {
    setResetType(resetType === 'simple' ? 'full' : 'simple');
    // Clear fields when switching modes
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // Clear errors
    setCurrentPasswordError(false);
    setNewPasswordError(false);
    setConfirmPasswordError(false);
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
          
          <TouchableOpacity style={styles.toggleButton} onPress={toggleResetType}>
            <Text style={styles.toggleButtonText}>
              {resetType === 'simple' 
                ? "Switch to manual password change" 
                : "Switch to email reset link"}
            </Text>
          </TouchableOpacity>

          <View style={styles.labelContainer}>
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

          {resetType === 'full' && (
            <>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Current Password</Text>
                {currentPasswordError && <Text style={styles.errorText}>*Required</Text>}
              </View>
              <TextInput
                style={[styles.input, currentPasswordError && styles.inputError]}
                secureTextEntry
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (text.trim()) setCurrentPasswordError(false);
                }}
                autoCapitalize="none"
              />
              
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>New Password</Text>
                {newPasswordError && <Text style={styles.errorText}>*Min. 6 characters</Text>}
              </View>
              <TextInput
                style={[styles.input, newPasswordError && styles.inputError]}
                secureTextEntry
                placeholder="Create new password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (text.trim() && text.length >= 6) setNewPasswordError(false);
                }}
                autoCapitalize="none"
              />
              
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>Confirm Password</Text>
                {confirmPasswordError && <Text style={styles.errorText}>*Passwords don't match</Text>}
              </View>
              <TextInput
                style={[styles.input, confirmPasswordError && styles.inputError]}
                secureTextEntry
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (text === newPassword) setConfirmPasswordError(false);
                }}
                autoCapitalize="none"
              />
            </>
          )}
          
          {resetType === 'simple' && (
            <Text style={styles.infoText}>
              We'll send a password reset link to your email address.
            </Text>
          )}
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
            <Text style={styles.resetButtonText}>
              {resetType === 'simple' ? 'Send Reset Link' : 'Update Password'}
            </Text>
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
  toggleButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  toggleButtonText: {
    color: '#145185',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
    paddingLeft: 8
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: 'red',
    marginLeft: 8,
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