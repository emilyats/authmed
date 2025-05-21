import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import LongArrow from '../../assets/svg/longarrow.svg';

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const router = useRouter();
  const user = FIREBASE_AUTH.currentUser;
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width <= 375;

  useEffect(() => {
    console.log('Current user:', user);
    const fetchHistory = async () => {
      if (!user) {
        setHistory([]);
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
        console.log('Fetched history:', items);
        setHistory(items);
      } catch (error) {
        setHistory([]);
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleStartScanning = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={isSmallScreen ? 20 : 24} color="#35383F" />
          <Text style={[styles.backText, { fontSize: isSmallScreen ? 14 : 16 }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: isSmallScreen ? 20 : 22 }]}>History</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#145185" />
        </View>
      ) : history.length === 0 ? (
        <View style={[styles.emptyContainer, { marginTop: isSmallScreen ? 120 : 160 }]}>
          <Text style={[styles.emptyText, { fontSize: isSmallScreen ? 13 : 15 }]}>You do not have any{'\n'}scanned medicines yet!</Text>
          <TouchableOpacity onPress={handleStartScanning}>
            <Text style={[styles.startScanning, { fontSize: isSmallScreen ? 13 : 15 }]}>Start Scanning</Text>
          </TouchableOpacity>
          <View style={styles.arrowContainer}>
            <LongArrow width={isSmallScreen ? 200 : 250} height={isSmallScreen ? 200 : 250} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {history.map((item, idx) => (
            <TouchableOpacity
              key={item.id || idx}
              style={styles.card}
              onPress={() => router.push({ pathname: '../ScanDetailScreen', params: { scanId: item.id } })}
            >
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.medicineName || 'Medicine Name'}</Text>
                <Text style={styles.cardSubtitle}>{item.scannedAt ? new Date(item.scannedAt.seconds * 1000).toLocaleString() : 'mm/dd/yyyy 00:00'}</Text>
              </View>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 0,
  },
  backText: {
    fontFamily: 'Montserrat_500Medium',
    color: '#35383F',
    marginLeft: 8,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    color: '#35383F',
    marginBottom: 18,
    marginTop: 30,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#145185',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  startScanning: {
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  arrowContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 80
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#3E719E',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
    elevation: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
    fontSize: 15,
  },
  cardSubtitle: {
    color: 'white',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
  },
  cardImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginLeft: 16,
    backgroundColor: '#35383F',
  },
  cardImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginLeft: 16,
    backgroundColor: '#35383F',
  },
});