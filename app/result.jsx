import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, TextInput, Platform, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { BlurView } from 'expo-blur';

// Replace static API_URL with platform-aware version
const getHost = () => {
  return '172.20.10.6'; // <-- your computer's LAN IP
};
const API_URL = `http://${getHost()}:8003`;


export default function ResultScreen() {
  const router = useRouter();
  const { detectionResult: drStr } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [note, setNote] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [actualLabel, setActualLabel] = useState('authentic');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [incorrectReason, setIncorrectReason] = useState(null);
  const [showMedicineCorrection, setShowMedicineCorrection] = useState(false);
  const [showAuthCorrection, setShowAuthCorrection] = useState(false);
  const [correctedMedicine, setCorrectedMedicine] = useState(null);
  const medicineOptions = [
    'biogesic', 'bioflu', 'buscopan', 'decolgen', 'flanax', 'imodium'
  ];
  const detectionResult = typeof drStr === 'string' ? JSON.parse(drStr) : drStr;

  if (!detectionResult || detectionResult.class === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <View style={{
            backgroundColor: '#F8D7DA',
            borderRadius: 16,
            padding: 28,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
            minWidth: 260
          }}>
            <Ionicons name="alert-circle" size={48} color="#F44336" style={{ marginBottom: 12 }} />
            <Text style={{
              color: '#B71C1C',
              fontSize: 18,
              fontFamily: 'Montserrat_700Bold',
              textAlign: 'center',
              marginBottom: 12
            }}>
              {detectionResult?.message || 'An error occurred while analyzing the image.'}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#145185',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginTop: 10
              }}
              onPress={() => router.replace('../(tabs)/home')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Montserrat_700Bold' }}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

  // Feedback submission handler
  const handleSubmitFeedback = async () => {
    const imageId = detectionResult.cropped_image_url?.split('/').pop();
    if (!imageId) {
      Alert.alert('Error', 'No image to send feedback for.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        image_id: imageId,
        actual_label: actualLabel,
        incorrect_reason: incorrectReason,
        corrected_medicine: correctedMedicine,
      };
      const { data } = await axios.post(
        `${API_URL}/feedback`,
        payload,
        { timeout: 5000 }
      );
      setFeedbackSubmitted(true);
      Alert.alert('Success', 'Thank you for your feedback!');
      setShowMedicineCorrection(false);
      setShowAuthCorrection(false);
      setShowFeedback(false);
      setIncorrectReason(null);
      setCorrectedMedicine(null);
    } catch (err) {
      console.error('Feedback error:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to submit feedback';
      Alert.alert('Feedback Error', msg);
    } finally {
      setSubmitting(false);
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('../(tabs)/home')}>
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
            {/* Feedback Button for Professionals */}
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                style={[
                  styles.feedbackOutlineButton,
                  { flexDirection: 'column', alignItems: 'center', minWidth: 180, justifyContent: 'center' }
                ]}
                onPress={() => {
                  if (feedbackSubmitted) {
                    Alert.alert("You've already submitted feedback!");
                  } else {
                    setFeedbackModalVisible(true);
                  }
                }}
              >
                <Ionicons name="medkit" size={22} color="#145185" style={{ marginBottom: 4 }} />
                <Text style={styles.feedbackOutlineButtonText}>Are you a healthcare professional?{"\n"}Give feedback!</Text>
              </TouchableOpacity>
            </View>
            {/* Feedback Modal */}
            <Modal
              visible={feedbackModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setFeedbackModalVisible(false)}
            >
              <BlurView intensity={30} tint="light" style={styles.modalOverlay}>
                <View style={[styles.feedbackBox, styles.shadow, { width: '90%' }]}> 
                  <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }} onPress={() => setFeedbackModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#145185" />
                  </TouchableOpacity>
                  {/* Step 1: Was result correct? */}
                  {!feedbackSubmitted && !showFeedback && !showMedicineCorrection && !showAuthCorrection && (
                    <>
                      <Ionicons name="help-circle" size={28} color="#145185" style={{ marginBottom: 6, marginTop: 10 }} />
                      <Text style={styles.feedbackPrompt}>
                        Do you think the result was correct?
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: '#4CAF50' }]}
                          onPress={() => { setFeedbackSubmitted(true); }}
                        >
                          <Ionicons name="checkmark-circle" size={18} color="white" style={{ marginRight: 6 }} />
                          <Text style={styles.feedbackButtonText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: '#F44336' }]}
                          onPress={() => { setShowFeedback(true); setIncorrectReason(null); }}
                        >
                          <Ionicons name="close-circle" size={18} color="white" style={{ marginRight: 6 }} />
                          <Text style={styles.feedbackButtonText}>No</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                  {/* Step 2: What was incorrect? */}
                  {!feedbackSubmitted && showFeedback && !showMedicineCorrection && !showAuthCorrection && (
                    <>
                      <Ionicons name="alert-circle" size={26} color="#145185" style={{ marginBottom: 6, marginTop: 10 }} />
                      <Text style={styles.feedbackPrompt}>
                        What was incorrect about the prediction?
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginVertical: 10, justifyContent: 'center' }}>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: incorrectReason === 'medicine' ? '#145185' : '#E0E0E0' }]}
                          onPress={() => setIncorrectReason('medicine')}
                        >
                          <Text style={[styles.feedbackButtonText, { color: incorrectReason === 'medicine' ? 'white' : '#35383F' }]}>Medicine name</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: incorrectReason === 'authenticity' ? '#145185' : '#E0E0E0' }]}
                          onPress={() => setIncorrectReason('authenticity')}
                        >
                          <Text style={[styles.feedbackButtonText, { color: incorrectReason === 'authenticity' ? 'white' : '#35383F' }]}>Authenticity</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10, justifyContent: 'center' }}>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: incorrectReason === 'both' ? '#145185' : '#E0E0E0' }]}
                          onPress={() => setIncorrectReason('both')}
                        >
                          <Text style={[styles.feedbackButtonText, { color: incorrectReason === 'both' ? 'white' : '#35383F' }]}>Both</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={[styles.saveButton, { marginTop: 8, minWidth: 120, alignSelf: 'center' }]}
                        onPress={() => {
                          if (incorrectReason === 'medicine') {
                            setShowMedicineCorrection(true);
                          } else if (incorrectReason === 'authenticity') {
                            setShowAuthCorrection(true);
                          } else if (incorrectReason === 'both') {
                            setShowMedicineCorrection(true);
                          }
                        }}
                        disabled={!incorrectReason}
                      >
                        <Text style={styles.saveButtonText}>Next</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {/* Step 3: Medicine correction */}
                  {showMedicineCorrection && !showAuthCorrection && (
                    <>
                      <Ionicons name="medkit" size={26} color="#145185" style={{ marginBottom: 6, marginTop: 10 }} />
                      <Text style={styles.feedbackPrompt}>
                        What is the correct medicine name?
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10 }}>
                        {medicineOptions.map(opt => (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.feedbackButton, { backgroundColor: correctedMedicine === opt ? '#145185' : '#E0E0E0', margin: 4 }]}
                            onPress={() => setCorrectedMedicine(opt)}
                          >
                            <Text style={[styles.feedbackButtonText, { color: correctedMedicine === opt ? 'white' : '#35383F' }]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={[styles.saveButton, { marginTop: 8, minWidth: 120, alignSelf: 'center' }]}
                        onPress={() => {
                          if (incorrectReason === 'both') {
                            setShowMedicineCorrection(false);
                            setShowAuthCorrection(true);
                          } else {
                            handleSubmitFeedback();
                          }
                        }}
                        disabled={!correctedMedicine}
                      >
                        <Text style={styles.saveButtonText}>Next</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {/* Step 4: Authenticity correction (after medicine or both) */}
                  {showAuthCorrection && (
                    <>
                      <Ionicons name="create" size={26} color="#145185" style={{ marginBottom: 6, marginTop: 10 }} />
                      <Text style={styles.feedbackPrompt}>
                        What is the correct authenticity?
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginVertical: 10 }}>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: actualLabel === 'authentic' ? '#4CAF50' : '#E0E0E0' }]}
                          onPress={() => setActualLabel('authentic')}
                        >
                          <Ionicons name="shield-checkmark" size={18} color={actualLabel === 'authentic' ? 'white' : '#35383F'} style={{ marginRight: 6 }} />
                          <Text style={[styles.feedbackButtonText, { color: actualLabel === 'authentic' ? 'white' : '#35383F' }]}>Authentic</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.feedbackButton, { backgroundColor: actualLabel === 'counterfeit' ? '#F44336' : '#E0E0E0' }]}
                          onPress={() => setActualLabel('counterfeit')}
                        >
                          <Ionicons name="alert" size={18} color={actualLabel === 'counterfeit' ? 'white' : '#35383F'} style={{ marginRight: 6 }} />
                          <Text style={[styles.feedbackButtonText, { color: actualLabel === 'counterfeit' ? 'white' : '#35383F' }]}>Counterfeit</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={[styles.saveButton, { marginTop: 8, minWidth: 120, alignSelf: 'center' }]}
                        onPress={handleSubmitFeedback}
                        disabled={!actualLabel}
                      >
                        <Text style={styles.saveButtonText}>Submit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {/* Step 5: Thank you */}
                  {feedbackSubmitted && (
                    <>
                      <Ionicons name="checkmark-done-circle" size={28} color="#4CAF50" style={{ marginBottom: 6, marginTop: 10 }} />
                      <Text style={[styles.feedbackPrompt, { color: '#4CAF50' }]}>Thank you for your feedback!</Text>
                    </>
                  )}
                </View>
              </BlurView>
            </Modal>

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
  feedbackBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feedbackPrompt: {
    color: '#145185',
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  feedbackButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackOutlineButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#145185',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginVertical: 4,
  },
  feedbackOutlineButtonText: {
    color: '#145185',
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
});