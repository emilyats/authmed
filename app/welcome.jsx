import React, { useState } from 'react';
import { ImageBackground, Text, View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AuthMedLogo2 from "../assets/svg/authmedlogo2.svg";
import { BackgroundImage } from '../components/ImagePreloader';

export default function WelcomeScreen() {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);

    const handlePress = () => {
      router.replace('(auth)/auth1');
    };
    
    return (
        <Pressable style={{ flex: 1 }} onPress={handlePress}>
            <ImageBackground
              source={BackgroundImage}
              resizeMode="cover"
              style={styles.imageBackground}
              onLoadEnd={() => setImageLoaded(true)}
            >
              {!imageLoaded && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#145185" />
                </View>
              )}
              
              <LinearGradient
                  colors={[
                      'rgba(228, 220, 220, 0.5)', 
                      'rgba(228, 220, 220, 0.5)',
                      'rgba(14, 53, 86, 0.8)'
                  ]}
                  style={styles.gradientOverlay}
              >
                  <View style={styles.rowContainer}>
                  <View style={styles.textColumn}>
                      <Text style={styles.welcome}>Welcome to</Text>
                      <View style={styles.authmedRow}>
                      <Text style={styles.auth}>auth</Text>
                      <Text style={styles.med}>med</Text>
                      </View>
                  </View>
                  <AuthMedLogo2 width={80} height={80} />
                  </View>
                  <Text style={styles.subtitle}>A quick and easy way {"\n"} to check for counterfeit medicines</Text>
                  <Text style={{fontFamily: 'Montserrat_400Regular', color: 'white', fontSize: 12, marginTop:20}}>Tap to continue</Text>
              </LinearGradient>
            </ImageBackground>
        </Pressable>
    );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 80,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    alignItems: 'flex-start',
    marginRight: 10,
  },
  welcome: {
    fontFamily: 'Montserrat_700Bold',
    color: 'white',
    fontSize: 30,
    marginBottom: 5,
  },
  authmedRow: {
    marginTop: -15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  auth: {
    fontFamily: 'Montserrat_700Bold',
    color: '#145185',
    fontSize: 39,
  },
  med: {
    fontFamily: 'Montserrat_700Bold',
    color: '#790000',
    fontSize: 39,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20
  },
});