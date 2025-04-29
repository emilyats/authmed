import { Asset } from 'expo-asset';

export const BackgroundImage = require("../assets/images/bg1.jpg");

export const preloadBackgroundImage = async () => {
  try {
    const asset = Asset.fromModule(BackgroundImage);
    
    await asset.downloadAsync();
    
    return true;
  } catch (error) {
    console.error('Error preloading background image:', error);
    return false;
  }
};