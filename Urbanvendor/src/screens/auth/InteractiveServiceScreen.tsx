import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

const { width, height } = Dimensions.get('window');

const services = [
  { id: '1', name: 'Plumbing', icon: 'pipe-wrench' },
  { id: '2', name: 'Electrical', icon: 'lightning-bolt' },
  { id: '3', name: 'Cleaning', icon: 'broom' },
  { id: '4', name: 'Painting', icon: 'format-paint' },
  { id: '5', name: 'Carpentry', icon: 'hammer' },
  { id: '6', name: 'AC Repair', icon: 'air-conditioner' },
  { id: '7', name: 'Appliance', icon: 'washing-machine' },
  { id: '8', name: 'Beauty', icon: 'face-woman' },
  { id: '9', name: 'Massage', icon: 'hand-heart' },
  { id: '10', name: 'Gardening', icon: 'flower' },
  { id: '11', name: 'Pest Control', icon: 'bug' },
  { id: '12', name: 'Car Wash', icon: 'car-wash' },
];

export default function InteractiveServiceScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);

  // Show 8 base services + 1 "More services" card
  const visibleServices = services.slice(0, 8);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNext = async () => {
    if (selectedServices.length === 0) {
      return;
    }

    // Map selected IDs to service objects (id + name) for backend compatibility
    const selectedServiceObjects = services
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => ({ id: s.id, name: s.name }));

    try {
      await authAPI.updateServices(selectedServiceObjects as any);
    } catch (e) {
      console.warn('Failed to update services on backend', e);
    }

    dispatch(
      updateUserProfile({
        services: selectedServiceObjects as any,
      })
    );

    navigation.navigate('WorkingHours');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Section */}
        <View style={styles.mainSection}>
          <View style={styles.illustrationContainer}>
            <Video
              source={{ uri: 'https://res.cloudinary.com/dosplgqif/video/upload/v1763209873/sign4_jprxxe.mp4' }}
              style={styles.serviceVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
          
          <Title style={styles.title}>Select Services</Title>
          <Text style={styles.subtitle}>
            Choose services you provide
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesGrid}>
            {visibleServices.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    isSelected && styles.serviceCardSelected
                  ]}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.serviceIcon,
                    isSelected && styles.serviceIconSelected
                  ]}>
                    <MaterialCommunityIcons 
                      name={service.icon as any} 
                      size={24} 
                      color={isSelected ? '#ffffff' : '#8B80F8'} 
                    />
                  </View>
                  <Text style={[
                    styles.serviceName,
                    isSelected && styles.serviceNameSelected
                  ]}>
                    {service.name}
                  </Text>
                  
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* More Services Card */}
            <TouchableOpacity
              style={styles.moreServicesCard}
              onPress={() => setShowAllServices(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIcon, styles.moreServicesIcon]}>
                <MaterialCommunityIcons name="dots-grid" size={24} color="#ffffff" />
              </View>
              <Text style={[styles.serviceName, styles.moreServicesText]}>More services</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Count */}
          {selectedServices.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.selectedText}>
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button - fixed at bottom, slightly above edge */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedServices.length > 0 && styles.continueButtonActive
          ]}
          onPress={handleNext}
          disabled={selectedServices.length === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedServices.length > 0 ? ['#8B80F8', '#A599FF'] : ['#e2e8f0', '#cbd5e1']}
            style={styles.buttonGradient}
          >
            <Text style={[
              styles.buttonText,
              selectedServices.length > 0 && styles.buttonTextActive
            ]}>
              Continue
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
      </View>

      {/* All Services Popup */}
      <Modal
        visible={showAllServices}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllServices(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Services</Text>
            <ScrollView style={styles.modalList}>
              <View style={styles.modalGrid}>
                {services.map(service => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceCard,
                        styles.modalServiceCard,
                        isSelected && styles.serviceCardSelected,
                      ]}
                      onPress={() => toggleService(service.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.serviceIcon,
                        isSelected && styles.serviceIconSelected,
                      ]}>
                        <MaterialCommunityIcons
                          name={service.icon as any}
                          size={24}
                          color={isSelected ? '#ffffff' : '#8B80F8'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.serviceName,
                          isSelected && styles.serviceNameSelected,
                        ]}
                      >
                        {service.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <MaterialCommunityIcons
                            name="check"
                            size={14}
                            color="#ffffff"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAllServices(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 200,
  },
  mainSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 260,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceVideo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  servicesSection: {
    marginBottom: 40,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  serviceCard: {
    width: (width - 80) / 3,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  serviceCardSelected: {
    borderColor: '#8B80F8',
    backgroundColor: '#8B80F8',
    elevation: 4,
    shadowColor: '#8B80F8',
    shadowOpacity: 0.3,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIconSelected: {
    backgroundColor: '#ffffff20',
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  serviceNameSelected: {
    color: '#ffffff',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  selectedText: {
    fontSize: 14,
    color: '#8B80F8',
    fontWeight: '600',
  },
  moreServicesCard: {
    width: (width - 80) / 3,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8B80F8',
    backgroundColor: '#8B80F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreServicesIcon: {
    backgroundColor: '#ffffff20',
  },
  moreServicesText: {
    color: '#ffffff',
  },
  buttonSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    paddingHorizontal: 24,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonActive: {
    elevation: 4,
    shadowColor: '#8B80F8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    backgroundColor: '#8B80F8',
    width: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalList: {
    marginBottom: 12,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalServiceCard: {
    width: (width * 0.9 - 64) / 3,
    height: 90,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  modalCloseButton: {
    borderRadius: 999,
    backgroundColor: '#8B80F8',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
