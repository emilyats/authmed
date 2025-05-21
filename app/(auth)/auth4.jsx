import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, Keyboard, TouchableWithoutFeedback, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

export default function ChangePasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const user = FIREBASE_AUTH.currentUser;

  const handleChangePassword = async () => {
    setGeneralError('');
    let hasError = false;
    if (!currentPassword) {
      setCurrentPasswordError(true);
      hasError = true;
    } else {
      setCurrentPasswordError(false);
    }
    if (!newPassword) {
      setNewPasswordError(true);
      hasError = true;
    } else {
      setNewPasswordError(false);
    }
    if (!confirmPassword) {
      setConfirmPasswordError(true);
      hasError = true;
    } else {
      setConfirmPasswordError(false);
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError(true);
      hasError = true;
    }
    if (hasError) return;
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert(
        "Password Changed",
        "Your password has been updated successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      let msg = 'Failed to change password. Please try again.';
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Current password is incorrect.';
        setCurrentPasswordError(true);
      } else if (err.code === 'auth/weak-password') {
        msg = 'New password is too weak (must be at least 6 characters).';
        setNewPasswordError(true);
      }
      setGeneralError(msg);
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
            <Text style={styles.headerText}>Change Password</Text>
            {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

            <View style={styles.labelRow}>
              <Text style={styles.labelText}>Current Password</Text>
              {currentPasswordError && <Text style={styles.errorText}>*Enter your current password</Text>}
            </View>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={text => {
                  setCurrentPassword(text);
                  if (text) setCurrentPasswordError(false);
                }}
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 14, top: 14 }}
                onPress={() => setShowCurrentPassword((prev) => !prev)}
              >
                <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={22} color="#35383F" />
              </TouchableOpacity>
            </View>

            <View style={styles.labelRow}>
              <Text style={styles.labelText}>New Password</Text>
              {newPasswordError && <Text style={styles.errorText}>*Enter a valid new password</Text>}
            </View>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  if (text) setNewPasswordError(false);
                  if (text === confirmPassword) setConfirmPasswordError(false);
                }}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 14, top: 14 }}
                onPress={() => setShowNewPassword((prev) => !prev)}
              >
                <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={22} color="#35383F" />
              </TouchableOpacity>
            </View>

            <View style={styles.labelRow}>
              <Text style={styles.labelText}>Confirm New Password</Text>
              {confirmPasswordError && <Text style={styles.errorText}>*Passwords do not match</Text>}
            </View>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (text === newPassword) setConfirmPasswordError(false);
                }}
                secureTextEntry={!showConfirmPassword}
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
            style={styles.resetButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.resetButtonText}>Change Password</Text>
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
  labelText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
    paddingLeft: 8,
    marginBottom: 4,
    marginTop: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 12,
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
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
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