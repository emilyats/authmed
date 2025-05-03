import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';

export default function MenuScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      router.replace('(auth)/auth1');
    } catch (error) {
      alert('Logout failed.');
    }
  };

  const handleNotExisting = () => {
    // Placeholder: navigate to change password screen if implemented
    alert('Coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#35383F" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <TouchableOpacity style={styles.menuButton} onPress={handleNotExisting}>
          <Text style={styles.menuButtonText}>Basta</Text>
          <Text style={styles.menuButtonSubtitle}>Di ko pa alam beh</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Help & Info</Text>
      <TouchableOpacity style={styles.menuButton} onPress={handleNotExisting}>
          <Text style={styles.menuButtonText}>Tutorial</Text>
          <Text style={styles.menuButtonSubtitle}>How to use AuthMed</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={handleNotExisting}>
          <Text style={styles.menuButtonText}>About AuthMed</Text>
          <Text style={styles.menuButtonSubtitle}>Information on Developers and Project</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={handleNotExisting}>
          <Text style={styles.menuButtonText}>Contact Us</Text>
          <Text style={styles.menuButtonSubtitle}>Developers' Contact Information</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>User</Text>
      <TouchableOpacity style={styles.menuButton} onPress={handleNotExisting}>
        <Text style={styles.menuButtonText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
        <Text style={styles.menuButtonText}>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    zIndex: 10,
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
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginBottom: 18,
    marginTop: 10,
  },
  menuButton: {
    backgroundColor: '#3E719E',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3.5,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  menuButtonSubtitle: {
    color: 'white',
    marginTop: 8,
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'left'
  },
});