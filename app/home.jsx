import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HistoryIcon from '../assets/svg/historyicon.svg';
import MenuIcon from '../assets/svg/menuicon.svg';
import ScanIcon from '../assets/svg/scanicon.svg';
import BottomBar from '../assets/svg/bottombar.svg';

export default function HomeScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [facing, setFacing] = useState('back');
    const [flashMode, setFlashMode] = useState('off');
    const [zoom, setZoom] = useState(0);
    const [photo, setPhoto] = useState(null);
    const cameraRef = useRef(null);
    const router = useRouter();

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
        return <View><Text>Requesting camera permission...</Text></View>;
      }
      if (!hasPermission) {
        return <View><Text>Camera permission denied.</Text></View>;
    }
    
    if (photo) {
        return (
          <SafeAreaView style={styles.imageContainer}>
            <Image style={styles.preview} source={{ uri: photo.uri }} />
            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.btn} onPress={() => setPhoto(null)}>
                <Ionicons name="trash-outline" size={30} color="black" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
    }
  const navigateToHistory = () => {
    router.push('/history');
  };

  const navigateToMenu = () => {
    router.push('/menu');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashMode}
        zoom={zoom}
      >
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
            style={{flex: 1}}
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

        {/* Bottom Navigation */}
        <TouchableOpacity style={styles.homeButton}>
            <ScanIcon/>
          </TouchableOpacity>
        <View style={styles.bottomBar}>
            <BottomBar/>
        </View>
        <TouchableOpacity style={styles.historyIcon} onPress={navigateToHistory}>
            <HistoryIcon width={40} height={40} fill="white" />
            <Text style={styles.historyLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuIcon} onPress={navigateToMenu}>
            <MenuIcon width={40} height={40} fill="white" />
            <Text style={styles.menuLabel}>Menu</Text>
        </TouchableOpacity>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  permissionButton: {
    backgroundColor: '#145185',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(20, 81, 133, 0.8)',
    borderRadius: 12,
  },
  zoomSlider: {
    position: 'absolute',
    bottom: 180,
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
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#145185',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150
  },
  scanButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.5,
    shadowRadius: 7,
  },
  homeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: '#3E719E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  menuIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 60
  },
  historyIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    left: 60
  },
  menuLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  historyLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 4,
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