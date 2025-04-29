import React, { createContext, useState, useContext, useEffect } from 'react';
import { Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const AppContext = createContext();

const imagesToPreload = [
  require("../assets/images/bg1.jpg"),
];

export const AppContextProvider = ({ children }) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = imagesToPreload.map(
          (image) => {
            return new Promise((resolve, reject) => {
              Image.prefetch(Image.resolveAssetSource(image).uri)
                .then(() => resolve())
                .catch(err => {
                  console.error('Error preloading image:', err);
                  resolve();
                });
            });
          }
        );

        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to preload images:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  const value = {
    imagesLoaded,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};