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
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter
import AuthMedLogo1 from "../assets/svg/authmedlogo1.svg";

const AuthMedLogo = () => (
  <View style={styles.logoContainer}>
    <AuthMedLogo1 width={200} height={200} />
  </View>
);

const LoginScreen = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const handleLogin = () => {
        setLoading(true);
        setTimeout(() => {
        setLoading(false);
        }, 2000);
    };

    const handleSignUp = () => {
        router.push('/auth2');
    }

    const handleReset = () => {
        router.push('/auth3');
    };

    const handleNoAccount = () => {
        //router.push('/nohistory');
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };
  
    return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
    <SafeAreaView style={styles.container}>
        <View style={styles.formContainer}>
        <AuthMedLogo />
        
        <Text style={styles.headerText}>Login to Your Account</Text>
        
        <Text style={styles.labelText}>Username</Text>
        <TextInput
            style={styles.input}
            placeholder=""
        />
        
        <Text style={styles.labelText}>Password</Text>
        <TextInput
            style={styles.input}
            secureTextEntry
            placeholder=""
        />
        
        <View style={styles.forgotPassContainer}>
            <Text style={styles.forgotPasswordText}>Forgot your password? </Text>
            <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
        >
            {loading ? (
            <ActivityIndicator size="small" color="white" />
            ) : (
            <Text style={styles.loginButtonText}>Login</Text>
            )}
        </TouchableOpacity>
        
        <View style={styles.signUpContainer}>
            <Text style={styles.noAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
        </View>
        
        <TouchableOpacity style={styles.proceedButton} onPress={handleNoAccount}>
            <Text style={styles.proceedButtonText}>Proceed without an account*</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimerText}>*User history is not saved</Text>
        </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
    );
    };

    const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: 'white',
    },
    formContainer: {
    padding: 35,
    flex: 1,
    justifyContent: 'center',
    },
    logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    },
    headerText: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginBottom: 30,
    textAlign: 'center',
    },
    labelText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
    marginBottom: 8,
    paddingLeft: 8
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
    forgotPassContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingLeft: 8,
    marginTop: -15,
    },
    forgotPasswordText: {
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
    color: '#333',
    },
    resetText: {
    fontSize: 10,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    },
    loginButton: {
    backgroundColor: '#145185',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    },
    loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    },
    signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    },
    noAccountText: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#333',
    },
    signUpText: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#145185',
    },
    dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    },
    divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    },
    dividerText: {
    paddingHorizontal: 10,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    fontSize: 16,
    },
    proceedButton: {
    backgroundColor: '#145185',
    borderRadius: 6,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    },
    proceedButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    },
    disclaimerText: {
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#145185',
    textAlign: 'center',
    },
    });

export default LoginScreen;