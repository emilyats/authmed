import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const router = useRouter();

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraPermission.status === 'granted');
    })();
  }, []);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode((current) => (current === 'on' ? 'off' : 'on'));
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

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {photo ? (
        <View style={styles.imageContainer}>
          <Image style={styles.preview} source={{ uri: photo.uri }} />
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.btn} onPress={() => setPhoto(null)}>
              <Ionicons name="trash-outline" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
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
              <TouchableOpacity>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
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
    resizeMode: 'cover',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  btn: {
    marginHorizontal: 20,
  },
});
