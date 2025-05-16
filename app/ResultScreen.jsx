import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from './(tabs)/home';

export default function ResultScreen() {
  const router = useRouter();
  const { detectionResult: detectionResultStr } = useLocalSearchParams();
  // Parse detectionResult from string if passed as JSON
  const detectionResult = typeof detectionResultStr === 'string' ? JSON.parse(detectionResultStr) : detectionResultStr;

  const getAuthenticityColor = (status) => {
    switch (status) {
      case 'authentic': return '#4CAF50';
      case 'suspected counterfeit': return '#FFC107';
      case 'counterfeit': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#35383F" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Detection Result</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            <Text style={{ fontFamily: 'Montserrat_500Medium', color: 'white' }}>Medicine Detected:</Text>
          </Text>
          <Text style={[styles.resultText, { marginTop: 4 }]}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: 'white' }}>{detectionResult.class}</Text>
          </Text>
          {detectionResult.cropped_image_url && (
            <Image
              source={{ uri: detectionResult.cropped_image_url }}
              style={styles.croppedImage}
              resizeMode="contain"
            />
          )}
          {detectionResult.authenticity && (
            <View style={[styles.authenticityContainer, { backgroundColor: getAuthenticityColor(detectionResult.authenticity.status) }]}> 
              <Text style={styles.authenticityText}>
                {`Authenticity: ${detectionResult.authenticity.status.toUpperCase()}\nConfidence: ${(detectionResult.authenticity.confidence * 100).toFixed(2)}%`}
              </Text>
            </View>
          )}
        </View>

        {detectionResult.authenticity && (
          <View style={styles.infoBox}>
            <Text style={styles.disclaimerText}>
              Disclaimer: This application is not 100% accurate. Always consult a healthcare professional or pharmacist for confirmation.
            </Text>
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommended Actions:</Text>
              <Text style={styles.recommendationItem}>• Check the packaging for tampering or errors.</Text>
              <Text style={styles.recommendationItem}>• Verify the medicine with your pharmacist.</Text>
              <Text style={styles.recommendationItem}>• Contact the manufacturer if in doubt.</Text>
              <Text style={styles.recommendationItem}>• Do not consume medicine if you are unsure of its authenticity.</Text>
            </View>
          </View>
        )}
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
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  resultBox: {
    backgroundColor: '#3E719F',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 370,
    marginTop: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginBottom: 10,
  },
  croppedImage: {
    width: 180,
    height: 180,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
  },
  authenticityContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  authenticityText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  disclaimerText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.8,
  },
  recommendationsContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(62,113,158,0.08)',
  },
  recommendationsTitle: {
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  recommendationItem: {
    color: '#fff',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 2,
  },
  infoBox: {
    backgroundColor: '#3E719F',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 370,
    marginTop: 10,
  },
}); 