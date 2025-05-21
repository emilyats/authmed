import { Stack } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import HistoryIcon from '../../assets/svg/historyicon.svg';
import MenuIcon from '../../assets/svg/menuicon.svg';
import HomeIcon from '../../assets/svg/homeicon.svg';
import BottomBar from '../../assets/svg/bottombar.svg';
import { Shadow } from 'react-native-shadow-2';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeScreen, setActiveScreen] = useState('home'); // Default to home
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width <= 375;
  
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
      <View style={styles.bottomBar}>
      <Shadow
        distance={15}
        startColor="#00000020"
        endColor="#00000000"
        offset={[0, 20]}
        style={[{
          bottom: 0
        }]}
      >
        <BottomBar width={width}/>
      </Shadow>
      </View>
      <TouchableOpacity 
        style={[
          styles.homeButton,
          { 
            bottom: isSmallScreen ? 22 : 25
          }
        ]} 
        onPress={navigateToHome}
        disabled={activeScreen === 'home'}
      >
        <Shadow
          distance={8}
          startColor={activeScreen === 'home' ? '#FFFFFF15' : '#3E719E35'}
          endColor={activeScreen === 'home' ? '#FFFFFF00' : '#3E719E00'}
          offset={[0, 0]}
        >
          <View style={styles.homeButtonContainer}>
            <HomeIcon width={isSmallScreen ? 75 : 90} />
          </View>
        </Shadow>
      </TouchableOpacity>

      <View style={[styles.bottomNavContainer, {
        bottom: isSmallScreen ? 0 : 7
      }]}>
        <TouchableOpacity 
          style={[
            styles.historyIcon,
            activeScreen === 'history' && styles.activeIcon
          ]} 
          onPress={navigateToHistory}
          disabled={activeScreen === 'history'}
        >
          <Shadow
            distance={10}
            startColor={activeScreen === 'history' ? '#FFFFFF20' : '#00000000'}
            endColor="#00000000"
            offset={[0, 0]}
          >
            <View style={styles.iconContainer}>
              <HistoryIcon 
                width={Platform.OS === 'ios' ? 30 : 25}
                height={Platform.OS === 'ios' ? 30 : 25} 
              />
            </View>
          </Shadow>
          <Text style={[
            styles.historyLabel,
            activeScreen === 'history'
          ]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuIcon,
          activeScreen === 'menu' && styles.activeIcon
          ]} 
          onPress={navigateToMenu}
          disabled={activeScreen === 'menu'}
        >
          <Shadow
            distance={10}
            startColor={activeScreen === 'menu' ? '#FFFFFF20' : '#00000000'}
            endColor="#00000000"
            offset={[0, 0]}
          >
            <View style={styles.iconContainer}>
              <MenuIcon 
                width={Platform.OS === 'ios' ? 30 : 25}
                height={Platform.OS === 'ios' ? 30 : 25} 
              />
            </View>
          </Shadow>
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
    bottom: 0,
    width: '100%',
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    alignSelf: 'center',
  },
  menuIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 60,
  },
  historyIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
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
  },
  iconContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  homeButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});