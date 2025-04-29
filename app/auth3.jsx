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
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function ResetPassScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to main app after reset
      // router.replace('/login');
    }, 2000);
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
          
          <Text style={styles.labelText}>Current Password</Text>
          <TextInput
            style={styles.input}
            placeholder=""
          />
          
          <Text style={styles.labelText}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder=""
          />
          
          <Text style={styles.labelText}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder=""
          />
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
            <Text style={styles.resetButtonText}>Reset Password</Text>
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
    paddingTop: 80,
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