import { Stack } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import HistoryIcon from '../../assets/svg/historyicon.svg';
import MenuIcon from '../../assets/svg/menuicon.svg';
import ScanIcon from '../../assets/svg/scanicon.svg';
import BottomBar from '../../assets/svg/bottombar.svg';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeScreen, setActiveScreen] = useState('home'); // Default to home
  
  // This effect runs whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      // Extract the current screen name from the pathname
      if (pathname.includes('history')) {
        setActiveScreen('history');
      } else if (pathname.includes('menu')) {
        setActiveScreen('menu');
      } else if (pathname.includes('home')) {
        setActiveScreen('home');
      }
    }, [pathname])
  );

  const navigateToHistory = () => {
    if (activeScreen !== 'history') {
      router.push('/(tabs)/history');
    }
  };

  const navigateToMenu = () => {
    if (activeScreen !== 'menu') {
      router.push('/(tabs)/menu');
    }
  };

  const navigateToHome = () => {
    if (activeScreen !== 'home') {
      router.push('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="home" 
          listeners={{
            focus: () => setActiveScreen('home'),
          }}
        />
        <Stack.Screen 
          name="menu" 
          listeners={{
            focus: () => setActiveScreen('menu'),
          }}
        />
        <Stack.Screen 
          name="history" 
          listeners={{
            focus: () => setActiveScreen('history'),
          }}
        />
      </Stack>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomBar}>
          <BottomBar />
        </View>

        <TouchableOpacity 
          style={[
            styles.historyIcon,
            activeScreen === 'history' && styles.activeIcon
          ]} 
          onPress={navigateToHistory}
          disabled={activeScreen === 'history'}
        >
          <HistoryIcon 
            width={30} 
            height={30} 
          />
          <Text style={[
            styles.historyLabel,
            activeScreen === 'history'
          ]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.homeButton,
            activeScreen === 'home' && styles.activeHomeButton
          ]} 
          onPress={navigateToHome}
          disabled={activeScreen === 'home'}
        >
          <ScanIcon />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuIcon,
          activeScreen === 'menu' && styles.activeIcon
          ]} 
          onPress={navigateToMenu}
          disabled={activeScreen === 'menu'}
        >
          <MenuIcon 
            width={30} 
            height={30} 
          />
          <Text style={[
            styles.menuLabel,
            activeScreen === 'menu'
          ]}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
  },
  homeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    paddingBottom: 10,
    alignSelf: 'center',
    shadowColor: '#3E719E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  activeHomeButton: {
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  menuIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 60,
  },
  historyIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    left: 60,
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeIcon: {
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  }
});