import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FIREBASE_DB } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
          <Ionicons name="arrow-back" size={24} color="#35383F" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Scan Details</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            <Text style={{ fontFamily: 'Montserrat_500Medium', color: 'white' }}>Medicine Detected:</Text>
          </Text>
          <Text style={[styles.resultText, { marginTop: 4 }]}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: 'white' }}>{scan.medicineName}</Text>
          </Text>
          {scan.imageUrl && (
            <Image source={{ uri: scan.imageUrl }} style={styles.croppedImage} resizeMode="contain" />
          )}
          <View style={[styles.authenticityContainer, { backgroundColor: getAuthenticityColor(scan.authenticity) }]}> 
            <Text style={styles.authenticityText}>
              {`Authenticity: ${scan.authenticity?.toUpperCase() || 'UNKNOWN'}\nConfidence: ${(scan.confidence * 100).toFixed(2)}%`}
            </Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Note:</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            multiline
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Note'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Scan</Text>
          </TouchableOpacity>
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
  infoBox: {
    backgroundColor: '#3E719F',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 370,
    marginTop: 10,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    minHeight: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#222',
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
  },
  saveButton: {
    backgroundColor: '#145185',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
}); 