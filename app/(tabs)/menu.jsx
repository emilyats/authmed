import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';

export default function MenuScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      router.replace('(auth)/auth1');
    } catch (error) {
      alert('Logout failed.');
    }
  };

  const changePassword = () => {
    router.push('/(auth)/auth4');
  };

  const handleNotExisting = () => {
    alert('Coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#35383F" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Help & Info</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('../tutorial')}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Tutorial</Text>
            <Text style={styles.menuButtonSubtitle}>How to use AuthMed</Text>
          </View>
          <Ionicons name="book" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('../about')}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>About AuthMed</Text>
            <Text style={styles.menuButtonSubtitle}>Information on Developers and Project</Text>
          </View>
          <Ionicons name="information-circle" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('../contact')}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Contact Us</Text>
            <Text style={styles.menuButtonSubtitle}>Developers' Contact Information</Text>
          </View>
          <Ionicons name="mail" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>User</Text>
        <TouchableOpacity style={styles.menuButton} onPress={changePassword}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Change Password</Text>
            <Text style={styles.menuButtonSubtitle}>Update your account password</Text>
          </View>
          <Ionicons name="key" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonText}>Logout</Text>
            <Text style={styles.menuButtonSubtitle}>Sign out of your account</Text>
          </View>
          <Ionicons name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuButton: {
    backgroundColor: '#3E719E',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
  },
  menuButtonSubtitle: {
    color: 'white',
    marginTop: 4,
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'left',
    opacity: 0.9,
  },
  menuButtonContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 15,
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  iconContainer: {
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#64748b',
  },
  modalScrollContent: {
    padding: 20,
  },
  developerInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 16,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoSection: {
    marginBottom: 25,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#4a5568',
    paddingLeft: 8,
  },
  aboutModalContent: {
    backgroundColor: '#f8fafc',
  },
  aboutModalHeader: {
    backgroundColor: '#3E719E',
    borderBottomWidth: 0,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  aboutCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  aboutModalTitle: {
    color: '#ffffff',
    fontSize: 24,
    marginTop: 8,
  },
  aboutModalSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
    fontSize: 14,
    marginTop: 2,
  },
  aboutIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  aboutInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 16,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  introSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
  },
  sectionContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  sectionIconContainer: {
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  aboutText: {
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: '#4a5568',
    lineHeight: 24,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  iconWrapper: {
    backgroundColor: '#3E719E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  subsectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  valueBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3E719E',
    marginTop: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  valueText: {
    flex: 1,
  },
  missionContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginTop: 32,
    marginHorizontal: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  subsection: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  missionSubsection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  visionSubsection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  valuesSubsection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  contactSubsection: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  lastContactItem: {
    marginBottom: 0,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(62, 113, 158, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  developersContainer: {
    marginTop: 32,
    paddingTop: 24,
  },
  developersScrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  developerCard: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 150,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  developerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#e2e8f0',
    borderWidth: 3,
    borderColor: '#3E719E',
  },
  developerName: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    textAlign: 'center',
    marginBottom: 6,
  },
  developerRole: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
  developerInitials: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
  },
  descriptionText: {
    fontSize: 17,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#3E719E',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  closingContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
  },
  closingText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#3E719E',
    fontSize: 17,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  historySection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
  solutionSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3E719E',
    paddingLeft: 16,
    marginBottom: 24,
  },
});