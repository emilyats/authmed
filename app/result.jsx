import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from './(tabs)/home';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ResultScreen() {
  const router = useRouter();
  const { detectionResult: detectionResultStr } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [note, setNote] = useState('');
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

  const handleSaveToHistory = async () => {
    try {
      setIsSaving(true);
      const user = FIREBASE_AUTH.currentUser;
      
      if (!user) {
        alert('Please sign in to save scan history');
        return;
      }

      const scanData = {
        userId: user.uid,
        medicineName: detectionResult.class,
        confidence: detectionResult.confidence,
        authenticity: detectionResult.authenticity?.status || 'unknown',
        authenticityConfidence: detectionResult.authenticity?.confidence || 0,
        imageUrl: detectionResult.cropped_image_url,
        note: note,
        scannedAt: serverTimestamp()
      };

      await addDoc(collection(FIREBASE_DB, 'scanHistory'), scanData);
      setIsSaved(true);
      alert('Scan saved to history successfully!');
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('Failed to save scan to history');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('../(tabs)/home')}>
            <Ionicons name="arrow-back" size={24} color="#145185" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Result</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            {detectionResult.cropped_image_url && (
              <Image
                source={{ uri: detectionResult.cropped_image_url }}
                style={styles.croppedImage}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.disclaimerBox}>
              <Ionicons name="warning-outline" size={24} color="#145185" style={{ marginBottom: 8 }}/>
              <Text style={styles.disclaimerText}>
                AuthMed only uses visual indicators to help verify medicine authenticity. To completely verify the authenticity of your medicine, please consult your healthcare provider or pharmacist.
              </Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.medicineLabel}>Medicine Detected</Text>
            <Text style={styles.medicineName}>{detectionResult.class}</Text>
              <View style={styles.disclaimerRow}>
              <Ionicons name="alert-circle" size={16} color="#145185" />
              <Text style={styles.medicineDisclaimer}>
                Please ensure that detected medicine is correct.
              </Text>
            </View>
            
            {detectionResult.authenticity && (
              <View style={[
                styles.authenticityBox, 
                { backgroundColor: getAuthenticityColor(detectionResult.authenticity.status) }
              ]}>
                <Text style={styles.authenticityStatus}>
                  {detectionResult.authenticity.status.toUpperCase()}
                </Text>
                <Text style={styles.authenticityConfidence}>
                  Confidence: {(detectionResult.authenticity.confidence * 100).toFixed(2)}%
                </Text>
              </View>
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)"
              value={note}
              onChangeText={setNote}
            />

            <TouchableOpacity 
              style={[styles.saveButton, isSaved && styles.saveButtonSaved]} 
              onPress={handleSaveToHistory}
              disabled={isSaving || isSaved}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons 
                    name={isSaved ? "checkmark-circle" : "save-outline"} 
                    size={20} 
                    color="white" 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveButtonText}>
                    {isSaved ? 'Saved to History' : 'Save to History'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

            <View style={styles.recommendationsBox}>
              <Text style={styles.recommendationsTitle}>Recommended Actions</Text>
              <View style={styles.recommendationsList}>
                <View style={styles.recommendationItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#145185" />
                  <Text style={styles.recommendationText}>Check the packaging for tampering or errors</Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Ionicons name="medical" size={16} color="#145185" />
                  <Text style={styles.recommendationText}>Verify the medicine with your pharmacist</Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Ionicons name="call" size={16} color="#145185" />
                  <Text style={styles.recommendationText}>Contact the manufacturer if in doubt</Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Ionicons name="alert-circle" size={16} color="#145185" />
                  <Text style={styles.recommendationText}>Do not consume medicine if unsure of authenticity</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
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
  mainContent: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  croppedImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#145185',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicineLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 4,
  },
  medicineName: {
    fontSize: 24,
    color: '#1E293B',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 8,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  medicineDisclaimer: {
    fontSize: 10,
    color: '#145185',
    fontFamily: 'Montserrat_500Medium',
  },
  authenticityBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  authenticityStatus: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 4,
  },
  authenticityConfidence: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    opacity: 0.9,
  },
  saveButton: {
    backgroundColor: '#145185',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonSaved: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  infoContainer: {
    gap: 16,
  },
  disclaimerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  disclaimerText: {
    color: '#145185',
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 25
  },
  recommendationsBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recommendationsTitle: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 16,
  },
});