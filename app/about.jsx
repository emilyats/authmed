import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ABOUT_INFO = {
  title: "About Us",
  team: "GGS(S)",
  description: "GGS(S), the AuthMed development team, is a team of dedicated developers committed to delivering digital health solutions that are intuitive, accessible, and impactful.",
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
    name: "Emily Anne A. Tan Sanchez",
    role: "Fullstack Developer & Project Manager",
    imageUrl: require("../assets/images/developers/emily.jpg")
  },
  {
    name: "Jienne Khalil A. Lechuga",
    role: "Quality Assurance Lead",
    imageUrl: require("../assets/images/developers/jienne.jpg")
  },
  {
    name: "Rizeth Marianne C. Marcelo",
    role: "Backend Developer",
    imageUrl: require("../assets/images/developers/zeth.jpg")
  },
  {
    name: "Michelle Gabrielle P. Ulanday",
    role: "Documentation Lead & Researcher",
    imageUrl: require("../assets/images/developers/michelle.jpg")
  }
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#35383F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About AuthMed</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.introSection}>
            <Text style={styles.descriptionText}>{ABOUT_INFO.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={24} color="#145185" />
              <Text style={styles.sectionTitle}>Our History</Text>
            </View>
            <Text style={styles.sectionText}>{ABOUT_INFO.history}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={24} color="#145185" />
              <Text style={styles.sectionTitle}>Our Solution</Text>
            </View>
            <Text style={styles.sectionText}>{ABOUT_INFO.solution}</Text>
          </View>

          <View style={styles.missionContainer}>
            <Text style={styles.missionTitle}>Our Mission, Vision, and Core Values</Text>

            <View style={styles.missionSection}>
              <View style={styles.missionHeader}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="flag" size={20} color="#ffffff" />
                </View>
                <Text style={styles.missionLabel}>Mission</Text>
              </View>
              <Text style={styles.missionText}>{ABOUT_INFO.mission}</Text>
            </View>

            <View style={styles.missionSection}>
              <View style={styles.missionHeader}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="eye" size={20} color="#ffffff" />
                </View>
                <Text style={styles.missionLabel}>Vision</Text>
              </View>
              <Text style={styles.missionText}>{ABOUT_INFO.vision}</Text>
            </View>

            <View style={styles.valuesSection}>
              <View style={styles.missionHeader}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="heart" size={20} color="#ffffff" />
                </View>
                <Text style={styles.missionLabel}>Core Values</Text>
              </View>
              {ABOUT_INFO.values.map((value, index) => (
                <View key={index} style={styles.valueItem}>
                  <View style={styles.valueBullet} />
                  <Text style={styles.valueText}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.developersSection}>
            <Text style={styles.developersTitle}>Meet Our Developers</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.developersScroll}
            >
              {DEVELOPER_PROFILES.map((developer, index) => (
                <View key={index} style={styles.developerCard}>
                  <Image
                    source={developer.imageUrl}
                    style={styles.developerImage}
                  />
                  <Text style={styles.developerName}>{developer.name}</Text>
                  <Text style={styles.developerRole}>{developer.role}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.closingSection}>
            <Text style={styles.closingText}>{ABOUT_INFO.closing}</Text>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  introSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#145185',
    fontFamily: 'Montserrat_600SemiBold',
  },
  sectionText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  missionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  missionTitle: {
    fontSize: 16,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionSection: {
    marginBottom: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  iconWrapper: {
    backgroundColor: '#145185',
    borderRadius: 8,
    padding: 8,
  },
  missionLabel: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  missionText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  valuesSection: {
    marginTop: 8,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
    paddingHorizontal: 4,
  },
  valueBullet: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#145185',
    marginTop: 12,
    marginLeft: 4,
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
  },
  developersSection: {
    marginBottom: 16,
  },
  developersTitle: {
    fontSize: 16,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  developersScroll: {
    paddingHorizontal: 4,
    gap: 12,
    paddingBottom: 8,
  },
  developerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  developerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  developerName: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  developerRole: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
  closingSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closingText: {
    fontSize: 15,
    color: '#145185',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
});