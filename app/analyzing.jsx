import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://192.168.1.13:8003';

export default function AnalyzingScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();

  useEffect(() => {
    detectMedicine(photoUri);
  }, [photoUri]);

  const detectMedicine = async (imageUri) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      // Send to backend
      const response = await axios.post(`${API_URL}/predict_roboflow`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if medicine was detected with sufficient confidence
      if (response.data.class === 'unknown' || response.data.confidence < 0.5) {
        alert('No medicine detected or image is too blurry. Please try again.');
        router.back();
        return;
      }

      // Get the cropped image URL from the response
      const croppedImageUrl = `${API_URL}${response.data.cropped_image_url}`;

      router.push({
        pathname: '/result',
        params: {
          detectionResult: JSON.stringify({
            ...response.data,
            cropped_image_url: croppedImageUrl
          }),
          photoUri: imageUri,
        },
      });
    } catch (error) {
      console.error('Error detecting medicine:', error);
      router.push({
        pathname: '/result',
        params: {
          detectionResult: JSON.stringify({
            class: 'error',
            confidence: 0,
            message: 'Error detecting medicine. Please try again.'
          }),
          photoUri: imageUri,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={32} color="white" />
      </TouchableOpacity>
      <Image 
        style={styles.preview} 
        source={{ uri: photoUri }} 
        resizeMode="contain"
      />
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.processingText}>Analyzing medicine...</Text>
        <Text style={[styles.processingText, { fontSize: 12, marginTop: 5 }]}>
          Press back to cancel
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 30,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
});