import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Title, Text, Button, Surface, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { serviceAPI } from '../../services/api';

const { width } = Dimensions.get('window');

interface Category {
  _id: string;
  name: string;
  level: 'main' | 'sub' | 'child';
  parentCategory?: string;
  icon?: string;
  image?: string;
  price?: number;
}

export default function ModernServiceSelectionScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'main' | 'sub' | 'child'>('main');
  const [breadcrumb, setBreadcrumb] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [currentLevel, breadcrumb]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const parentId = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1]._id : undefined;
      const response = await serviceAPI.getCategories(currentLevel, parentId);

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    if (category.level === 'child') {
      // Toggle selection for child categories (actual services)
      toggleSelection(category._id);
    } else {
      // Drill down for main and sub categories
      drillDown(category);
    }
  };

  const toggleSelection = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const drillDown = (category: Category) => {
    setBreadcrumb([...breadcrumb, category]);
    if (category.level === 'main') {
      setCurrentLevel('sub');
    } else if (category.level === 'sub') {
      setCurrentLevel('child');
    }
  };

  const goBack = () => {
    const newBreadcrumb = [...breadcrumb];
    newBreadcrumb.pop();
    setBreadcrumb(newBreadcrumb);

    if (newBreadcrumb.length === 0) {
      setCurrentLevel('main');
    } else if (newBreadcrumb.length === 1) {
      setCurrentLevel('sub');
    }
  };

  const handleNext = () => {
    if (selectedCategories.length > 0) {
      // Save selected categories to vendor profile
      navigation.navigate('OnboardingComplete', { selectedCategories });
    }
  };

  const getCategoryIcon = (category: Category): any => {
    // Map category names to icons
    const iconMap: { [key: string]: any } = {
      'Plumbing': 'pipe-wrench',
      'Electrical': 'lightning-bolt',
      'Cleaning': 'broom',
      'Painting': 'format-paint',
      'Carpentry': 'hammer',
      'AC Repair': 'air-conditioner',
      'Appliance': 'washing-machine',
      'Beauty': 'face-woman',
      'Massage': 'hand-heart',
    };
    return iconMap[category.name] || 'tools';
  };

  const getCategoryColor = (index: number): string => {
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16'];
    return colors[index % colors.length];
  };

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          {breadcrumb.length > 0 ? (
            <Button
              mode="text"
              onPress={goBack}
              style={styles.backButton}
              textColor="#64748b"
            >
              <MaterialCommunityIcons name="arrow-left" size={24} />
            </Button>
          ) : (
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              textColor="#64748b"
            >
              <MaterialCommunityIcons name="arrow-left" size={24} />
            </Button>
          )}
        </View>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbText}>
              {breadcrumb.map(cat => cat.name).join(' > ')}
            </Text>
          </View>
        )}

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.illustrationCircle}
          >
            <MaterialCommunityIcons name="account-hard-hat" size={50} color="#ffffff" />
          </LinearGradient>
        </View>

        {/* Main Content Card */}
        <Surface style={styles.mainCard} elevation={4}>
          <View style={styles.cardContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Title style={styles.mainTitle}>
                {currentLevel === 'main' && 'Select Your Service Category'}
                {currentLevel === 'sub' && 'Choose Subcategory'}
                {currentLevel === 'child' && 'Select Services'}
              </Title>
              <Text style={styles.subtitle}>
                {currentLevel === 'child'
                  ? 'Tap to select the specific services you provide'
                  : 'Tap a category to explore more options'}
              </Text>
            </View>

            {/* Loading State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <>
                {/* Categories Grid */}
                <View style={styles.servicesGrid}>
                  {categories.map((category, index) => {
                    const isSelected = selectedCategories.includes(category._id);
                    const color = getCategoryColor(index);
                    const icon = getCategoryIcon(category);

                    return (
                      <TouchableOpacity
                        key={category._id}
                        style={[
                          styles.serviceCard,
                          isSelected && styles.serviceCardSelected
                        ]}
                        onPress={() => handleCategoryPress(category)}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={isSelected
                            ? [color, color + 'CC']
                            : ['#ffffff', '#ffffff']
                          }
                          style={styles.serviceCardGradient}
                        >
                          <View style={[
                            styles.serviceIcon,
                            { backgroundColor: isSelected ? '#ffffff20' : color + '20' }
                          ]}>
                            <MaterialCommunityIcons
                              name={icon}
                              size={28}
                              color={isSelected ? '#ffffff' : color}
                            />
                          </View>
                          <Text style={[
                            styles.serviceName,
                            { color: isSelected ? '#ffffff' : '#1e293b' }
                          ]}>
                            {category.name}
                          </Text>

                          {category.level !== 'child' && (
                            <View style={styles.arrowIcon}>
                              <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={isSelected ? '#ffffff' : color}
                              />
                            </View>
                          )}

                          {isSelected && (
                            <View style={styles.checkmark}>
                              <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Count */}
                {selectedCategories.length > 0 && (
                  <View style={styles.selectedCount}>
                    <Chip
                      mode="flat"
                      style={styles.countChip}
                      textStyle={styles.countChipText}
                    >
                      {selectedCategories.length} service{selectedCategories.length > 1 ? 's' : ''} selected
                    </Chip>
                  </View>
                )}

                {/* Action Button */}
                {currentLevel === 'child' && (
                  <LinearGradient
                    colors={selectedCategories.length > 0 ? ['#6366f1', '#8b5cf6'] : ['#e2e8f0', '#cbd5e1']}
                    style={styles.buttonGradient}
                  >
                    <Button
                      mode="contained"
                      onPress={handleNext}
                      disabled={selectedCategories.length === 0}
                      style={styles.actionButton}
                      buttonColor="transparent"
                      textColor={selectedCategories.length > 0 ? "#ffffff" : "#94a3b8"}
                      labelStyle={styles.buttonLabel}
                    >
                      Continue
                    </Button>
                  </LinearGradient>
                )}
              </>
            )}
          </View>
        </Surface>

        {/* Bottom Navigation Dots */}
        <View style={styles.navigationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  breadcrumbContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: '100%',
    marginBottom: 32,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginBottom: 30,
  },
  cardContent: {
    padding: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  serviceCard: {
    width: (width - 112) / 3,
    height: 110,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceCardSelected: {
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  serviceCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
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
  selectedCount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countChip: {
    backgroundColor: '#f0f4ff',
  },
  countChipText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  buttonGradient: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButton: {
    paddingVertical: 8,
    elevation: 0,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    backgroundColor: '#6366f1',
    width: 24,
  },
});
