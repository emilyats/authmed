import { View, ActivityIndicator, Text, Image, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import AuthMedLogo1 from "../assets/svg/authmedlogo1.svg";
import { useRouter } from "expo-router";
import { BackgroundImage, preloadBackgroundImage } from '../components/ImagePreloader';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';

export default function SplashScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { height, width } = Dimensions.get('window');

  useEffect(() => {
    const loadAssets = async () => {
      try {
        await preloadBackgroundImage();
        
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error in asset loading:', error);
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Check auth state after splash loading
      const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
        if (user) {
          router.replace('(tabs)/home');
        } else {
          router.replace('/welcome');
        }
      });
      return () => unsubscribe();
    }
  }, [isLoading, router]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Image
        source={BackgroundImage}
        style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }}
      />
      
      <View style={{ 
        alignItems: 'center', 
        marginTop: height * 0.35,
        transform: [{ scale: Math.min(width / 400, 1) }] 
      }}>
        <AuthMedLogo1 width={250} height={250} />
      </View>
      
      <View style={{ 
        flex: 1, 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        marginBottom: height * 0.15,
        transform: [{ scale: Math.min(width / 400, 1) }] 
      }}>
        <ActivityIndicator size="large" color="#145185" />
        <Text style={{ 
          fontFamily: 'Montserrat_500Medium', 
          color: '#145185', 
          marginTop: 15,
          fontSize: Math.min(width * 0.04, 16)
        }}>
          {isLoading ? "Loading..." : "Ready!"}
        </Text>
      </View>
    </View>
  );
}