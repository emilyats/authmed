import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CONTACT_INFO = {
  name: "AuthMed Development Team",
  email: "202210736@fit.edu.ph",
  phone: "+63 939 939 2548",
  location: "FEU Institute of Technology",
};

export default function ContactScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#35383F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.introSection}>
            <Text style={styles.introText}>
              Have questions or concerns? We're here to help! Get in touch with us through any of the following channels:
            </Text>
          </View>

          <View style={styles.contactSection}>
            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={24} color="#145185" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactText}>{CONTACT_INFO.email}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="call" size={24} color="#145185" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactText}>{CONTACT_INFO.phone}</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.contactItem, styles.lastContactItem]}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={24} color="#145185" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactText}>{CONTACT_INFO.location}</Text>
              </View>
            </View>

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
    padding: 20,
  },
  introSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  introText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
  },
  contactSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  lastContactItem: {
    borderBottomWidth: 0,
  },
});