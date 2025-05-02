import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC31AZ2puxhW1f3r-_DAZeXDd-8UNwEkvk",
  authDomain: "spanel-3f7b4.firebaseapp.com",
  databaseURL: "https://spanel-3f7b4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spanel-3f7b4",
  storageBucket: "spanel-3f7b4.firebasestorage.app",
  messagingSenderId: "853023880902",
  appId: "1:853023880902:web:bcb0bff5e94477744809c7",
  measurementId: "G-NVC91BC1BV"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});