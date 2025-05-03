import { View, ActivityIndicator, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import AuthMedLogo1 from "../assets/svg/authmedlogo1.svg";
import { useRouter } from "expo-router";
import { BackgroundImage, preloadBackgroundImage } from '../components/ImagePreloader';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        await preloadBackgroundImage();
        setIsLoading(false);
      } catch (error) {
        console.error('Error in asset loading:', error);
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        // User is signed in, go to home
        router.replace('/home');
      } else {
        // No user is signed in, go to welcome
        router.replace('/welcome');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Image
        source={BackgroundImage}
        style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }}
      />
      
      <View style={{ alignItems: 'center', marginTop: 350 }}>
        <AuthMedLogo1 width={250} height={250} />
      </View>
      
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 150 }}>
        <ActivityIndicator size="large" color="#145185" />
        <Text style={{ 
          fontFamily: 'Montserrat_500Medium', 
          color: '#145185', 
          marginTop: 15 
        }}>
          {isLoading ? "Loading..." : "Ready!"}
        </Text>
      </View>
    </View>
  );
}