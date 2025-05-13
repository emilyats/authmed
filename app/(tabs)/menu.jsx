import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';

const DEVELOPER_INFO = {
  name: "AuthMed Development Team",
  email: "202210736@fit.edu.ph",
  phone: "+63 939 939 2548",
  location: "FEU Institute of Technology",
};

export default function MenuScreen() {
  const router = useRouter();
  const [contactModalVisible, setContactModalVisible] = useState(false);

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
        <TouchableOpacity style={styles.menuButton} onPress={() => setContactModalVisible(true)}>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setContactModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#35383F" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people" size={32} color="#ffffff" />
                </View>
                <Text style={styles.modalTitle}>Development Team</Text>
                <Text style={styles.modalSubtitle}>Get to know our team</Text>
              </View>
            </View>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.developerInfo}>
                <View style={styles.infoSection}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="business" size={20} color="#2563eb" />
                    <Text style={styles.infoTitle}>Team</Text>
                  </View>
                  <Text style={styles.infoText}>{DEVELOPER_INFO.name}</Text>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="location" size={20} color="#2563eb" />
                    <Text style={styles.infoTitle}>Location</Text>
                  </View>
                  <Text style={styles.infoText}>{DEVELOPER_INFO.location}</Text>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="mail" size={20} color="#2563eb" />
                    <Text style={styles.infoTitle}>Contact</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={16} color="#64748b" style={styles.contactIcon} />
                    <Text style={styles.infoText}>{DEVELOPER_INFO.email}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={16} color="#64748b" style={styles.contactIcon} />
                    <Text style={styles.infoText}>{DEVELOPER_INFO.phone}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 15,
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#64748b',
  },
  modalScrollContent: {
    padding: 20,
  },
  developerInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 20,
  },
  infoSection: {
    marginBottom: 25,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1e293b',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#64748b',
    marginBottom: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    marginRight: 10,
  },
});