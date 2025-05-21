import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

const TUTORIAL_STEPS = [
  {
    title: "Select Medicine",
    description: "Place your medicine on a flat, well-lit surface. Make sure the medicine's name and logo are clearly visible.",
    icon: "medical",
  },
  {
    title: "Capture Image",
    description: "Position your camera so that the medicine is within the frame. Hold steady and capture the medicine.",
    icon: "camera",
  },
  {
    title: "Scan Examples",
    description: "Examples of good and poor medicine scans to help you get the best results.",
    icon: "images",
  },
  {
    title: "View Results",
    description: "Review the authentication results, which include the detected medicine name and authenticity status.",
    icon: "checkmark-circle",
  },
  {
    title: "Save to History",
    description: "Save your scan results to keep track of your medicine authentications. Add notes if needed.",
    icon: "save",
  },
  {
    title: "Check History",
    description: "Access your previous scans anytime from the history tab. Review past authentications and notes.",
    icon: "time",
  },
  {
    title: "Tips",
    description: "Important guidelines to help you get the most accurate results.",
    icon: "bulb",
  }
];

const GOOD_SCAN = {
  title: "Good Scan Example",
  description: "Clear, well-lit, centered image",
  image: require("../assets/images/tutorial/good-scan.jpg"),
  type: "good"
};

const POOR_SCAN = {
  title: "Poor Scan Example",
  description: "Blurry, dark, or angled image",
  image: require("../assets/images/tutorial/bad-scan.jpg"),
  type: "bad"
};

const PRO_TIPS = [
  {
    icon: "bulb",
    text: "Ensure good lighting for better scan accuracy"
  },
  {
    icon: "warning",
    text: "Always verify results with your healthcare provider"
  },
  {
    icon: "scan",
    text: "Keep the medicine steady while scanning"
  }
];

export default function TutorialScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
        <Ionicons name="help-circle" size={24} color="white" />
        <Text style={styles.headerTitle}>How to Use AuthMed</Text>
        </View>
    </View>

      <View style={styles.introSection}>
        <Text style={styles.introText}>
          Follow these simple steps to authenticate your medicine using AuthMed:
        </Text>
      </View>

      <View style={styles.tutorialContainer}>
        <ScrollView 
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const slide = Math.floor(nativeEvent.contentOffset.x / windowWidth);
            setCurrentStep(slide);
          }}
          scrollEventThrottle={16}
        >
          {/* Step 1: Select Medicine */}
          <View style={[styles.slide, { width: windowWidth }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="medical" size={24} color="#ffffff" />
                  </View>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepNumber}>Step 1</Text>
                    <Text style={styles.stepTitle}>Select Medicine</Text>
                  </View>
                </View>
                <Text style={styles.stepDescription}>
                  {TUTORIAL_STEPS[0].description}
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Step 2: Capture Image */}
          <View style={[styles.slide, { width: windowWidth }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="camera" size={24} color="#ffffff" />
                  </View>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepNumber}>Step 2</Text>
                    <Text style={styles.stepTitle}>Capture Image</Text>
                  </View>
                </View>
                <Text style={styles.stepDescription}>
                  {TUTORIAL_STEPS[1].description}
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Step 3: Scan Examples */}
          <View style={[styles.slide, { width: windowWidth }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="images" size={24} color="#ffffff" />
                  </View>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepNumber}>Step 3</Text>
                    <Text style={styles.stepTitle}>Scan Examples</Text>
                  </View>
                </View>
                <Text style={styles.stepDescription}>
                  {TUTORIAL_STEPS[2].description}
                </Text>
              </View>

              <View style={styles.sampleSection}>
                <Text style={styles.sampleTitle}>Good Scan Example</Text>
                <View style={styles.sampleItem}>
                  <View style={styles.sampleHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.sampleTitle}>{GOOD_SCAN.title}</Text>
                  </View>
                  <Image 
                    source={GOOD_SCAN.image} 
                    style={styles.sampleImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.sampleDescription}>{GOOD_SCAN.description}</Text>
                </View>
              </View>

              <View style={styles.sampleSection}>
                <Text style={styles.sampleTitle}>Poor Scan Example</Text>
                <View style={styles.sampleItem}>
                  <View style={styles.sampleHeader}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                    <Text style={styles.sampleTitle}>{POOR_SCAN.title}</Text>
                  </View>
                  <Image 
                    source={POOR_SCAN.image} 
                    style={styles.sampleImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.sampleDescription}>{POOR_SCAN.description}</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Steps 4-5 */}
          {TUTORIAL_STEPS.slice(3, 5).map((step, index) => (
            <View key={index + 3} style={[styles.slide, { width: windowWidth }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <View style={styles.iconWrapper}>
                      <Ionicons name={step.icon} size={24} color="#ffffff" />
                    </View>
                    <View style={styles.stepTitleContainer}>
                      <Text style={styles.stepNumber}>Step {index + 4}</Text>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </ScrollView>
            </View>
          ))}

          {/* Final Steps */}
          {TUTORIAL_STEPS.slice(5).map((step, index) => (
            <View key={index + 5} style={[styles.slide, { width: windowWidth }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <View style={styles.iconWrapper}>
                      <Ionicons name={step.icon} size={24} color="#ffffff" />
                    </View>
                    <View style={styles.stepTitleContainer}>
                      <Text style={styles.stepNumber}>Step {index + 6}</Text>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>

                {index === 1 && (
                  <View style={styles.tipsSection}>
                    {PRO_TIPS.map((tip, i) => (
                      <View key={i} style={styles.tipItem}>
                        <Ionicons name={tip.icon} size={16} color="#145185" />
                        <Text style={styles.tipText}>{tip.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        <View style={styles.pagination}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentStep === index && styles.activeDot
              ]}
            />
          ))}
        </View>

        <View style={styles.skipContainer}>
        <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => router.back()}
        >
            <Text style={styles.skipText}>Skip Tutorial   </Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#145185',
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: 'white',
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  skipButton: {
    backgroundColor: '#145185',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  introSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  introText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconWrapper: {
    backgroundColor: '#145185',
    borderRadius: 12,
    padding: 10,
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 16,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
  },
  stepDescription: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  sampleSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleTitle: {
    fontSize: 16,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sampleSubtitle: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 16,
    textAlign: 'center',
  },
  sampleItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sampleImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 12,
  },
  sampleDescription: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
  tipsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipsTitle: {
    fontSize: 16,
    color: '#145185',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Montserrat_500Medium',
  },
  tutorialContainer: {
    flex: 1,
  },
  slide: {
    padding: 16,
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    backgroundColor: '#145185',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});