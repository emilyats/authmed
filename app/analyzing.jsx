import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import mime from 'mime';
import * as FileSystem from 'expo-file-system';

const API_URL = 'http://172.20.10.3:8003';

// Utility to ensure file:// URI for Android uploads
async function ensureFileUri(uri) {
  if (uri.startsWith('file://')) {
    return uri;
  }
  // For content:// URIs, copy to cache and return file:// URI
  const fileName = uri.split('/').pop();
  const newPath = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: newPath });
  return newPath;
}

export default function AnalyzingScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();
  const cancelTokenSourceRef = useRef(null);

  useEffect(() => {
    if (!photoUri) {
      Alert.alert('No photo found', 'Please try again.');
      router.back();
      return;
    }
    detectMedicine(photoUri);
    // Cancel on unmount
    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Request cancelled by user');
      }
    };
  }, [photoUri]);

  const detectMedicine = async (imageUri) => {
    try {
      // Ensure file:// URI for Android (content:// not supported by FormData/Axios)
      const fileUri = await ensureFileUri(imageUri);
      // Check if file exists before reading
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.error('File does not exist at:', fileUri);
        Alert.alert('File Error', 'The selected image could not be found. Please try again.');
        router.back();
        return;
      }
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      const payload = {
        image_base64: base64,
        filename: 'photo.jpg',
        mime: mime.getType(fileUri) || 'image/jpeg',
      };
      // Create a CancelToken source for this request
      const source = axios.CancelToken.source();
      cancelTokenSourceRef.current = source;
      const response = await axios.post(
        `${API_URL}/predict_base64`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          cancelToken: source.token,
        }
      );
      if (response.data.class === 'unknown' || response.data.confidence < 0.1) {
        const msg = response.data.message;
        if (msg === 'Medicine is not included in system.' || msg === 'Unsupported class detected') {
          Alert.alert('Not Included', 'Medicine is not included in system.');
        } else if (msg === 'Image is unclear. Please try again with a clearer photo.') {
          Alert.alert('Blurry Image', msg);
        } else if (msg === 'Image has poor lighting. Please retake in better conditions.') {
          Alert.alert('Poor lighting', msg);
        } else {
          Alert.alert('Error', 'No medicine detected or image is too unclear. Please try again.');
        }
        router.back();
        return;
      }
      let croppedImageUrl = response.data.cropped_image_url;
      if (croppedImageUrl && croppedImageUrl.startsWith('/static/')) {
        croppedImageUrl = `${API_URL}${croppedImageUrl}`;
      }
      router.replace({
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
      if (axios.isCancel(error)) {
        console.log('Request cancelled by user');
        return;
      }
      if (error.response && error.response.status === 500) {
        Alert.alert('Server Error', 'A server error occurred. Please try again later.');
        router.back();
        return;
      }
      if (error.message && error.message.includes('Network Error')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
        router.back();
        return;
      }
      Alert.alert('Error', 'Error detecting medicine. Please try again.');
      console.error('Error detecting medicine:', error);
      router.replace({
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
      <TouchableOpacity onPress={() => {
        if (cancelTokenSourceRef.current) {
          cancelTokenSourceRef.current.cancel('Request cancelled by user');
        }
        router.back();
      }} style={styles.backButton}>
        <Ionicons name="arrow-back" size={32} color="white" />
      </TouchableOpacity>
      <Image 
        style={styles.preview} 
        source={{ uri: photoUri }} 
        resizeMode="contain"
      />
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.processingText}>Analyzing...</Text>
        <Text style={[styles.processingText, { fontSize: 12, marginTop: 5 }]}>Press back to cancel</Text>
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