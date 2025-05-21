import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FIREBASE_DB } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { format } from 'date-fns';

export default function ScanDetailScreen() {
  const { scanId } = useLocalSearchParams();
  const router = useRouter();
  const [scan, setScan] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const docRef = doc(FIREBASE_DB, 'scanHistory', scanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setScan(docSnap.data());
          setNote(docSnap.data().note || '');
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load scan data.');
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [scanId]);

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const docRef = doc(FIREBASE_DB, 'scanHistory', scanId);
      await updateDoc(docRef, { note });
      Alert.alert('Success', 'Note saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save note.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    Alert.alert('Delete Scan', 'Are you sure you want to delete this scan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(FIREBASE_DB, 'scanHistory', scanId));
            Alert.alert('Deleted', 'Scan deleted.');
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete scan.');
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!scan) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 40 }}>Scan not found.</Text>;

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
          <Ionicons name="arrow-back" size={24} color="#145185" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Details</Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
      >
        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            {scan.imageUrl && (
              <Image
                source={{ uri: scan.imageUrl }}
                style={styles.croppedImage}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.disclaimerBox}>
              <Ionicons name="warning-outline" size={24} color="#145185" style={{ marginBottom: 6 }}/>
              <Text style={styles.disclaimerText}>
                AuthMed only uses visual indicators to help verify medicine authenticity. To completely verify the authenticity of your medicine, please consult your healthcare provider or pharmacist.
              </Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.medicineLabel}>Medicine Detected</Text>
            <Text style={styles.medicineName}>{scan.medicineName}</Text>

            <Text style={styles.dateLabel}>Scanned on</Text>
            <Text style={styles.dateText}>
              {scan.scannedAt?.toDate ? 
                format(scan.scannedAt.toDate(), 'PPpp') :
                'Date not available'}
            </Text>
            
            <View style={[
              styles.authenticityBox,
              { backgroundColor: getAuthenticityColor(scan.authenticity) }
            ]}>
              <Text style={styles.authenticityStatus}>
                {scan.authenticity?.toUpperCase() || 'UNKNOWN'}
              </Text>
              <Text style={styles.authenticityConfidence}>
                Confidence: {(scan.authenticityConfidence * 100).toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Note</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              multiline
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveNote}
              disabled={saving}
            >
              <Ionicons name="save-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </View>

            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.deleteButtonText}>Delete Scan</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginLeft: 12,
  },
  backButton: {
    padding: 8,
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
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 16,
  },
  authenticityBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
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
  notesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#145185',
  },
  notesTitle: {
    fontSize: 18,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 12,
  },
  noteInput: {
    width: '100%',
    minHeight: 100,
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
    color: '#1E293B',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#145185',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
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
  deleteButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});