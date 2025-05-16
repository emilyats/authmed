import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// Your computer's actual IP address
const API_URL = 'http://192.168.0.19:8003';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [img, setImg] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  const { width, height } = Dimensions.get('window');

  const checkPermissions = async () => {
    try {
      console.log("[CAM] Requesting permissions");
      const [mediaStatus, cameraStatus] = await Promise.all([
        MediaLibrary.requestPermissionsAsync(),
        Camera.requestCameraPermissionsAsync()
      ]);
      setHasPermission(cameraStatus.status === 'granted');
      return cameraStatus.status === 'granted';
    } catch (error) {
      console.error("[CAM] Permission error:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      const hasPermission = await checkPermissions();
      if (mounted && hasPermission) {
        setShowCamera(true);
      }
    };

    setupCamera();

    return () => {
      mounted = false;
      setShowCamera(false);
      if (cameraRef.current) {
        cameraRef.current.pausePreview();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (hasPermission) {
        if (cameraRef.current) {
          cameraRef.current.resumePreview();
        }
      }

      return () => {
        if (cameraRef.current) {
          cameraRef.current.pausePreview();
        }
        // Clear photo state when navigating away
        setPhoto(null);
        setImg(null);
      };
    }, [hasPermission])
  );

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode((current) => (current === 'on' ? 'off' : 'on'));
  };

  const detectMedicine = async (imageUri) => {
    try {
      setIsProcessing(true);
      
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

      // Get the cropped image URL from the response
      const croppedImageUrl = `${API_URL}${response.data.cropped_image_url}`;

      router.push({
        pathname: '../ResultScreen',
        params: {
          detectionResult: JSON.stringify({
            ...response.data,
            cropped_image_url: croppedImageUrl // Pass the full URL
          }),
          photoUri: imageUri,
        },
      });
    } catch (error) {
      console.error('Error detecting medicine:', error);
      router.push({
        pathname: '/(tabs)/ResultScreen',
        params: {
          detectionResult: JSON.stringify({
            class: 'error',
            confidence: 0,
            message: 'Error detecting medicine. Please try again.'
          }),
          photoUri: imageUri,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        skipProcessing: true,
      };
      const newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
      console.log('Photo URI:', newPhoto.uri);
      await detectMedicine(newPhoto.uri);
    }
  };

  const handleBackToCamera = () => {
    setPhoto(null);
    setDetectionResult(null);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        aspect: undefined,
        exif: true,
        base64: true,
        presentationStyle: 'fullScreen'
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setPhoto({
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height
        });
        setImg(selectedAsset.uri);
        await detectMedicine(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const getAuthenticityColor = (status) => {
    switch (status) {
      case 'authentic':
        return '#4CAF50'; // Green
      case 'suspected counterfeit':
        return '#FFC107'; // Yellow
      case 'counterfeit':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  if (hasPermission === null) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Requesting camera permission...</Text></View>;
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission denied.</Text>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBackToCamera} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image 
          style={styles.preview} 
          source={{ uri: photo.uri }} 
          resizeMode="contain"
        />
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Analyzing medicine...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashMode}
        zoom={zoom}
      />

      <SafeAreaView style={styles.uiContainer}>
        {/* Top Camera Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash}>
            <Ionicons 
              name={flashMode === 'on' ? "flash" : "flash-off"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Zoom Slider */}
        <View style={styles.zoomSlider}>
          <TouchableOpacity onPress={() => setZoom(Math.max(0, zoom - 0.1))}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>

          <Slider
            style={{ flex: 1 }}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={setZoom}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#AAAAAA"
          />

          <TouchableOpacity onPress={() => setZoom(Math.min(1, zoom + 0.1))}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  uiContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: 'white',
  },
  topBar: {
    marginTop: StatusBar.currentHeight || 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(20, 81, 133, 0.8)',
    borderRadius: 12,
  },
  zoomSlider: {
    position: 'absolute',
    bottom: 190,
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  zoomText: {
    fontFamily: 'Montserrat_400Regular',
    color: 'white',
    fontSize: 20,
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  scanButton: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: '#145185',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  btnContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  btn: {
    marginHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight || 80,
    left: 20,
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
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#3E719F',
    padding: 15,
    borderRadius: 10,
  },
  resultContainerCentered: {
    position: 'absolute',
    top: '42%',
    left: 20,
    right: 20,
    transform: [{ translateY: -150 }],
    backgroundColor: '#3E719F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
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
    paddingTop: 10
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
  croppedImage: {
    width: 180,
    height: 180,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
  },
});
