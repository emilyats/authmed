import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Linking,
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import AuthMedLogo2 from '../../assets/svg/authmedlogo2.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your computer's actual IP address
const API_URL = 'http://172.20.10.3:8003';


export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = FIREBASE_AUTH.currentUser;
  const { width, height } = Dimensions.get('window');

    useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const isFirstTimeUser = await AsyncStorage.getItem('isFirstTimeUser');
      
      if (isFirstTimeUser === 'true') {
        // Clear the flag
        await AsyncStorage.setItem('isFirstTimeUser', 'false');
        // Navigate to tutorial
        router.push('../tutorial');
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const fetchRecentScans = async () => {
    if (!user) {
      setRecentScans([]);
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(FIREBASE_DB, 'scanHistory'),
        where('userId', '==', user.uid),
        orderBy('scannedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentScans(items.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent scans:', error);
      setRecentScans([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentScans();
      return () => {};
    }, [user])
  );

  const handleScan = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        exif: true,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        router.push({
          pathname: '../analyzing',
          params: { photoUri: photo.uri }
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
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
        router.push({
          pathname: '../analyzing',
          params: { photoUri: selectedAsset.uri }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <AuthMedLogo2 width={100} height={100} />
          <Text style={[styles.title]}>Welcome to AuthMed</Text>
          <Text style={styles.subtitle}>Scan your medicines to verify their authenticity</Text>
        </View>

        <View style={styles.scanSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scan Medicine</Text>
          </View>
          <View style={styles.scanOptionsWrapper}>
            <View style={styles.scanOptionsContainer}>
              <TouchableOpacity style={styles.scanOption} onPress={handleScan}>
                <View style={styles.scanIconContainer}>
                  <Ionicons name="camera" size={32} color="white" />
                </View>
                <Text style={styles.scanOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.scanOption} onPress={pickImage}>
                <View style={styles.scanIconContainer}>
                  <Ionicons name="images" size={32} color="white" />
                </View>
                <Text style={styles.scanOptionText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.recentScansContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#145185" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#145185" />
          ) : recentScans.length === 0 ? (
            <Text style={styles.emptyText}>You do not have any scanned medicines yet!</Text>
          ) : (
            <View style={styles.recentScansGrid}>
              {recentScans.map((item, idx) => (
                <TouchableOpacity
                  key={item.id || idx}
                  style={styles.squareCard}
                  onPress={() => router.push({ pathname: '../scandetail', params: { scanId: item.id } })}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.squareCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.squareCardImagePlaceholder} />
                  )}
                  <Text style={styles.squareCardTitle} numberOfLines={1}>
                    {item.medicineName || 'Medicine Name'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.quickLinksContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickLinksScrollContent}
          >
            <TouchableOpacity 
              style={styles.quickLinkButton}
              onPress={() => Linking.openURL('https://www.fda.gov.ph/advisories/')}
            >
              <Ionicons name="newspaper" size={24} color="#145185" />
              <Text style={styles.quickLinkText}>FDA Advisories</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickLinkButton}
              onPress={() => Linking.openURL('https://www.fda.gov.ph/intensified-campaign-against-counterfeit-pharmaceutical-products/')}
            >
              <Ionicons name="warning" size={24} color="#145185" />
              <Text style={styles.quickLinkText}>FDA Counterfeit Medicines Campaign</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickLinkButton}
              onPress={() => Linking.openURL('https://www.unilab.com.ph/health-tips/how-do-you-know-if-your-medicine-is-fake/')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#145185" />
              <Text style={styles.quickLinkText}>Unilab Tips</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginBottom: 6,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  scanOptionsWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#F8FAFC',
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
  },
  scanOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  scanOption: {
    backgroundColor: '#3E719E',
    borderRadius: 16,
    alignItems: 'center',
    width: 125,
    height: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  scanIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scanOptionText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  recentScansContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    fontSize: 18,
  },
  recentScansGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    width: '100%',
  },
  squareCard: {
    width: 120,
    height: 120,
    backgroundColor: '#3E719E',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  squareCardImage: {
    width: '100%',
    height: '80%',
    backgroundColor: '#35383F',
  },
  squareCardImagePlaceholder: {
    width: '100%',
    height: '80%',
    backgroundColor: '#35383F',
  },
  squareCardTitle: {
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    padding: 5,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  permissionText: {
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
    textAlign: 'center',
    marginBottom: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#145185',
    fontSize: 14,
    marginRight: 4,
  },
  quickLinksContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  quickLinksScrollContent: {
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    gap: 18,
    alignItems: 'center',
  },
  quickLinkButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: 200,
    height: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickLinkText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#145185',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  scanSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  scanSubtitle: {
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
    fontSize: 14,
  },
});
