import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';

const DEVELOPER_INFO = {
  name: "AuthMed Development Team",
  email: "202210736@fit.edu.ph",
  phone: "+63 939 939 2548",
  location: "FEU Institute of Technology",
};

const ABOUT_INFO = {
  title: "About Us",
  team: "GGS(S)",
  description: "GGS(S) is a team of dedicated developers committed to delivering digital health solutions that are intuitive, accessible, and impactful.",
  history: "Founded in 2025, GGS(S) emerged in response to a growing need for reliable and accessible medicine authentication, particularly in addressing the increasing prevalence of counterfeit over-the-counter (OTC) medications. The rapid expansion of internet access has, unfortunately, enabled the spread of counterfeit pharmaceutical products, placing public health at risk. Traditionally, verifying the authenticity of medicine required laboratory testing, an approach that is both time-consuming and often inaccessible to the average consumer.",
  solution: "To address this issue, we developed AuthMed, a mobile solution designed to enable users to scan and authenticate medicines instantly, eliminating the need for specialized equipment or laboratory procedures.",
  mission: "To empower individuals with reliable, accessible digital tools that protect health and enhance well-being.",
  vision: "A future where everyone, regardless of location or background, can trust the medicines they use.",
  values: [
    "Progress – We embrace innovation, leveraging the latest in artificial intelligence and mobile technology to drive our solutions forward.",
    "Honesty – We stand against deception in healthcare. Our work is rooted in the belief that no one should unknowingly consume counterfeit medication.",
    "User-Centric Design – We prioritize simplicity, ensuring that our tools are easy to use and accessible to all."
  ],
  closing: "With just a simple scan, lives can be saved and health safeguarded."
};

const DEVELOPER_PROFILES = [
  {
    name: "Jienne Khalil A. Lechuga",
    role: "Database Specialist",
    imageUrl: require("../../assets/images/developers/jienne.jpg")
  },
  {
    name: "Rizeth Marianne C. Marcelo",
    role: "Backend Developer",
    imageUrl: require("../../assets/images/developers/zeth.jpg")
  },
  {
    name: "Emily Anne A. Tan Sanchez",
    role: "Lead Programmer & Frontend Developer",
    imageUrl: require("../../assets/images/developers/emily.jpg")
  },
  {
    name: "Michelle Gabrielle P. Ulanday",
    role: "Full Stack Developer & Documentation Lead",
    imageUrl: require("../../assets/images/developers/michelle.jpg")
  }
];

export default function MenuScreen() {
  const router = useRouter();
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

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
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Tutorial</Text>
            <Text style={styles.menuButtonSubtitle}>How to use AuthMed</Text>
          </View>
          <Ionicons name="book" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setAboutModalVisible(true)}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>About AuthMed</Text>
            <Text style={styles.menuButtonSubtitle}>Information on Developers and Project</Text>
          </View>
          <Ionicons name="information-circle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setContactModalVisible(true)}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Contact Us</Text>
            <Text style={styles.menuButtonSubtitle}>Developers' Contact Information</Text>
          </View>
          <Ionicons name="mail" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>User</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleNotExisting}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Change Password</Text>
            <Text style={styles.menuButtonSubtitle}>Update your account password</Text>
          </View>
          <Ionicons name="key" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Logout</Text>
            <Text style={styles.menuButtonSubtitle}>Sign out of your account</Text>
          </View>
          <Ionicons name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.aboutModalContent]}>
            <View style={[styles.modalHeader, styles.aboutModalHeader]}>
              <TouchableOpacity 
                style={[styles.closeButton, styles.aboutCloseButton]} 
                onPress={() => setContactModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <View style={[styles.iconContainer, styles.aboutIconContainer]}>
                  <Ionicons name="people" size={40} color="#ffffff" />
                </View>
                <Text style={[styles.modalTitle, styles.aboutModalTitle]}>Contact Us</Text>
                <Text style={[styles.modalSubtitle, styles.aboutModalSubtitle]}>Get in touch with our team</Text>
              </View>
            </View>

            <ScrollView 
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.developerInfo}>
                <View style={styles.infoSection}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="business" size={24} color="#3E719E" />
                    <Text style={styles.infoTitle}>Team Name</Text>
                  </View>
                  <Text style={styles.infoText}>{DEVELOPER_INFO.name}</Text>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="location" size={24} color="#3E719E" />
                    <Text style={styles.infoTitle}>Location</Text>
                  </View>
                  <Text style={styles.infoText}>{DEVELOPER_INFO.location}</Text>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="mail" size={24} color="#3E719E" />
                    <Text style={styles.infoTitle}>Email</Text>
                  </View>
                  <Text style={styles.infoText}>{DEVELOPER_INFO.email}</Text>
                </View>

                <View style={[styles.infoSection, { marginBottom: 0 }]}>
                  <View style={styles.infoHeaderRow}>
                    <Ionicons name="call" size={24} color="#3E719E" />
                    <Text style={styles.infoTitle}>Phone</Text>
                  </View>
                  <Text style={styles.infoText}>{DEVELOPER_INFO.phone}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.aboutModalContent]}>
            <View style={[styles.modalHeader, styles.aboutModalHeader]}>
              <TouchableOpacity 
                style={[styles.closeButton, styles.aboutCloseButton]} 
                onPress={() => setAboutModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <View style={[styles.iconContainer, styles.aboutIconContainer]}>
                  <Ionicons name="information-circle" size={40} color="#ffffff" />
                </View>
                <Text style={[styles.modalTitle, styles.aboutModalTitle]}>{ABOUT_INFO.title}</Text>
                <Text style={[styles.modalSubtitle, styles.aboutModalSubtitle]}>{ABOUT_INFO.team}</Text>
              </View>
            </View>

            <ScrollView 
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.aboutInfo}>
                <View style={styles.introSection}>
                  <Text style={[styles.aboutText, styles.descriptionText]}>{ABOUT_INFO.description}</Text>
                </View>
                
                <View style={[styles.sectionContainer, styles.historySection]}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="time" size={24} color="#3E719E" />
                  </View>
                  <Text style={styles.aboutText}>{ABOUT_INFO.history}</Text>
                </View>
                
                <View style={[styles.sectionContainer, styles.solutionSection]}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="bulb" size={24} color="#3E719E" />
                  </View>
                  <Text style={styles.aboutText}>{ABOUT_INFO.solution}</Text>
                </View>

                <View style={[styles.sectionContainer, styles.missionContainer]}>
                  <Text style={styles.sectionTitle}>Our Mission, Vision, and Core Values</Text>
                  
                  <View style={[styles.subsection, styles.missionSubsection]}>
                    <View style={styles.subsectionHeader}>
                      <View style={styles.iconWrapper}>
                        <Ionicons name="flag" size={20} color="#ffffff" />
                      </View>
                      <Text style={styles.subsectionTitle}>Mission</Text>
                    </View>
                    <Text style={styles.aboutText}>{ABOUT_INFO.mission}</Text>
                  </View>

                  <View style={[styles.subsection, styles.visionSubsection]}>
                    <View style={styles.subsectionHeader}>
                      <View style={styles.iconWrapper}>
                        <Ionicons name="eye" size={20} color="#ffffff" />
                      </View>
                      <Text style={styles.subsectionTitle}>Vision</Text>
                    </View>
                    <Text style={styles.aboutText}>{ABOUT_INFO.vision}</Text>
                  </View>

                  <View style={[styles.subsection, styles.valuesSubsection]}>
                    <View style={styles.subsectionHeader}>
                      <View style={styles.iconWrapper}>
                        <Ionicons name="heart" size={20} color="#ffffff" />
                      </View>
                      <Text style={styles.subsectionTitle}>Core Values</Text>
                    </View>
                    {ABOUT_INFO.values.map((value, index) => (
                      <View key={index} style={styles.valueContainer}>
                        <View style={styles.valueBullet} />
                        <Text style={[styles.aboutText, styles.valueText]}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={[styles.sectionContainer, styles.developersContainer]}>
                  <Text style={styles.sectionTitle}>Meet Our Developers</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.developersScrollContent}
                  >
                    {DEVELOPER_PROFILES.map((developer, index) => (
                      <View key={index} style={styles.developerCard}>
                        {developer.imageUrl ? (
                          <Image
                            source={developer.imageUrl}
                            style={styles.developerImage}
                          />
                        ) : (
                          <View style={styles.developerImage}>
                            <Text style={styles.developerInitials}>
                              {developer.name.split(' ').map(n => n[0]).join('')}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.developerName}>{developer.name}</Text>
                        <Text style={styles.developerRole}>{developer.role}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.closingContainer}>
                  <Text style={[styles.aboutText, styles.closingText]}>{ABOUT_INFO.closing}</Text>
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
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
  },
  menuButtonSubtitle: {
    color: 'white',
    marginTop: 4,
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'left',
    opacity: 0.9,
  },
  menuButtonContent: {
    flex: 1,
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
    paddingHorizontal: 10,
    paddingBottom: 10,
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 16,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoSection: {
    marginBottom: 25,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#4a5568',
    paddingLeft: 8,
  },
  aboutModalContent: {
    backgroundColor: '#f8fafc',
  },
  aboutModalHeader: {
    backgroundColor: '#3E719E',
    borderBottomWidth: 0,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  aboutCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  aboutModalTitle: {
    color: '#ffffff',
    fontSize: 24,
    marginTop: 8,
  },
  aboutModalSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
    fontSize: 14,
    marginTop: 2,
  },
  aboutIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  aboutInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 16,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  introSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
  },
  sectionContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  sectionIconContainer: {
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  aboutText: {
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: '#4a5568',
    lineHeight: 24,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  iconWrapper: {
    backgroundColor: '#3E719E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  subsectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  valueBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3E719E',
    marginTop: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  valueText: {
    flex: 1,
  },
  missionContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginTop: 32,
    marginHorizontal: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  subsection: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  missionSubsection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  visionSubsection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  valuesSubsection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  contactSubsection: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  lastContactItem: {
    marginBottom: 0,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  developersContainer: {
    marginTop: 32,
    paddingTop: 24,
  },
  developersScrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  developerCard: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 150,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  developerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#e2e8f0',
    borderWidth: 3,
    borderColor: '#3E719E',
  },
  developerName: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    textAlign: 'center',
    marginBottom: 6,
  },
  developerRole: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
  developerInitials: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
  },
  descriptionText: {
    fontSize: 17,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  closingContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  closingText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#3E719E',
    fontSize: 17,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  historySection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  solutionSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
});