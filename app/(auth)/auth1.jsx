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
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import AuthMedLogo1 from '../../assets/svg/authmedlogo1.svg';
import { FIREBASE_AUTH, FIREBASE_APP } from '../../firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const AuthMedLogo = () => (
  <View style={styles.logoContainer}>
    <AuthMedLogo1 width={200} height={200} />
  </View>
);

const LoginScreen = () => {
    const { height, width } = Dimensions.get('window');
    const isSmallScreen = width < 375;
    const scale = Math.min(width / 400, 1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const auth = FIREBASE_AUTH;
    
    const validateInputs = () => {
        let isValid = true;
        
        // Check email
        if (!email.trim()) {
            setEmailError(true);
            isValid = false;
        } else {
            setEmailError(false);
        }
        
        // Check password
        if (!password.trim()) {
            setPasswordError(true);
            isValid = false;
        } else {
            setPasswordError(false);
        }
        
        return isValid;
    };
    
    const handleLogin = async () => {
        if (!validateInputs()) {
            return;
        }
    
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const user = response.user;
    
            if (!user.emailVerified) {
                await auth.signOut(); // log them out
                alert('Please verify your email before logging in.');
                return;
            }
    
            console.log('Login successful:', user);
            router.replace('(tabs)/home'); // Navigate to your home screen
        } catch (error) {
            console.log(error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    

    const handleSignUp = () => {
        router.push('/auth2');
    };

    const handleReset = () => {
        router.push('/auth3');
    };

    const handleNoAccount = () => {
        router.replace('(tabs)/home');
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };
  
    return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View>
              <View style={[styles.logoContainer, { transform: [{ scale }] }]}>
                <AuthMedLogo1 width={200} height={200} />
              </View>
              
              <Text style={[styles.headerText, { fontSize: isSmallScreen ? 20 : 24 }]}>Login to Your Account</Text>
              
              <View style={styles.labelRow}>
                <Text style={[styles.labelText, { fontSize: isSmallScreen ? 10 : 12 }]}>Email</Text>
                {emailError && <Text style={styles.errorText}>*Email missing</Text>}
              </View>
              <TextInput
                style={[styles.input, emailError && styles.inputError, { 
                  height: isSmallScreen ? 45 : 50,
                  fontSize: isSmallScreen ? 14 : 16
                }]}
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
                <Text style={[styles.labelText, { fontSize: isSmallScreen ? 10 : 12 }]}>Password</Text>
                {passwordError && <Text style={styles.errorText}>*Password missing</Text>}
              </View>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.input, passwordError && styles.inputError, { 
                    height: isSmallScreen ? 45 : 50,
                    fontSize: isSmallScreen ? 14 : 16
                  }]}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (text.trim()) setPasswordError(false);
                  }}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 14, top: 14 }}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#35383F" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.forgotPassContainer, { marginBottom: isSmallScreen ? 15 : 20 }]}>
                <Text style={[styles.forgotPasswordText, { fontSize: isSmallScreen ? 9 : 10 }]}>Forgot your password? </Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={[styles.resetText, { fontSize: isSmallScreen ? 9 : 10 }]}>Reset</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.loginButton, { 
                  height: isSmallScreen ? 45 : 50,
                  marginBottom: isSmallScreen ? 15 : 20
                }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={[styles.loginButtonText, { fontSize: isSmallScreen ? 14 : 16 }]}>Login</Text>
                )}
              </TouchableOpacity>
              
              <View style={[styles.signUpContainer, { marginBottom: isSmallScreen ? 15 : 20 }]}>
                <Text style={[styles.noAccountText, { fontSize: isSmallScreen ? 12 : 14 }]}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={[styles.signUpText, { fontSize: isSmallScreen ? 12 : 14 }]}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 35,
        paddingBottom: 50,
        justifyContent: 'center'
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerText: {
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
    },
    labelText: {
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
        borderWidth: 1,
        borderColor: '#35383F',
        borderRadius: 14,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontFamily: 'Montserrat_400Regular',
    },
    inputError: {
        borderColor: 'red',
    },
    forgotPassContainer: {
        flexDirection: 'row',
        paddingLeft: 8,
        marginTop: -15,
    },
    forgotPasswordText: {
        fontFamily: 'Montserrat_400Regular',
        color: '#333',
    },
    resetText: {
        color: '#145185',
        fontFamily: 'Montserrat_700Bold',
    },
    loginButton: {
        backgroundColor: '#145185',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonText: {
        color: 'white',
        fontFamily: 'Montserrat_600SemiBold',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    noAccountText: {
        fontFamily: 'Montserrat_400Regular',
        color: '#333',
    },
    signUpText: {
        color: '#145185',
        fontFamily: 'Montserrat_700Bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#666',
        fontFamily: 'Montserrat_500Medium',
    },
    proceedButton: {
        backgroundColor: '#145185',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    proceedButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Montserrat_600SemiBold',
    },
    disclaimerText: {
        textAlign: 'center',
        color: '#666',
        fontFamily: 'Montserrat_400Regular',
        marginTop: 10,
    },
});

export default LoginScreen;