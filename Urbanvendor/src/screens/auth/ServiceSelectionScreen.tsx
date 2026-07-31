import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, BackHandler, Dimensions } from 'react-native';
import { Card, Title, Text, Checkbox, Button, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateVendorServices } from '@/store/slices/authSlice';
import { serviceAPI } from '@/services/api';

export default function ServiceSelectionScreen({ navigation }: any) {
  const [currentCategories, setCurrentCategories] = useState<any[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServiceObjects, setSelectedServiceObjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sidebar State
  const [fullCategoryTree, setFullCategoryTree] = useState<any[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    loadMainCategories();

    if (user?.services && user.services.length > 0) {
      const existingIds = user.services.map((s: any) => s.id || s._id);
      setSelectedServices(existingIds);
      setSelectedServiceObjects(user.services);
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (breadcrumbs.length > 0) {
        handleBack();
        return true;
      }
      return false;
    });

    // Load full tree for Web Sidebar
    if (Platform.OS === 'web') {
      loadFullTree();
    }

    return () => backHandler.remove();
  }, []);

  const loadMainCategories = async () => {
    setIsLoading(true);
    try {
      const response = await serviceAPI.getCategories('main');
      if (response.data.success) {
        setCurrentCategories(response.data.data as any[]);
      }
    } catch (error) {
      console.error('Failed to load main categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubCategories = async (parentId: string) => {
    setIsLoading(true);
    try {
      const response = await serviceAPI.getCategories(undefined, parentId);
      if (response.data.success) {
        setCurrentCategories(response.data.data as any[]);
      }
    } catch (error) {
      console.error('Failed to load sub categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFullTree = async () => {
    setIsLoadingTree(true);
    try {
      const [mainRes, subRes, childRes] = await Promise.all([
        serviceAPI.getCategories('main'),
        serviceAPI.getCategories('sub'),
        serviceAPI.getCategories('child')
      ]);

      if (mainRes.data.success && subRes.data.success && childRes.data.success) {
        const mains = mainRes.data.data || [];
        const subs = subRes.data.data || [];
        const children = childRes.data.data || [];

        const idsMatch = (a: any, b: any) => {
          if (!a || !b) return false;
          const aId = typeof a === 'object' ? (a._id || a.id) : a;
          const bId = typeof b === 'object' ? (b._id || b.id) : b;
          return String(aId) === String(bId);
        };

        // Build Tree
        const mainsList = Array.isArray(mains) ? mains : [];
        const subsList = Array.isArray(subs) ? subs : [];
        const childrenList = Array.isArray(children) ? children : [];

        const tree = mainsList.map((main: any) => {
          const mainId = main.id || main._id;

          const relevantSubs = subsList.filter((s: any) =>
            idsMatch(s.parentCategory, mainId) || idsMatch(s.category, mainId)
          );

          const subsWithChildren = relevantSubs.map((sub: any) => {
            const subId = sub.id || sub._id;
            const relevantChildren = childrenList.filter((c: any) =>
              idsMatch(c.parentCategory, subId) || idsMatch(c.category, subId)
            );
            return { ...sub, children: relevantChildren };
          });

          return { ...main, subCategories: subsWithChildren };
        });
        setFullCategoryTree(tree);
      }
    } catch (error) {
      console.error("Failed to load category tree:", error);
    } finally {
      setIsLoadingTree(false);
    }
  };

  const handleCategoryPress = (category: any) => {
    const categoryId = category.id || category._id;

    if (breadcrumbs.length < 2) {
      setBreadcrumbs([...breadcrumbs, category]);
      loadSubCategories(categoryId);
    } else {
      toggleService(category);
    }
  };

  const handleBack = () => {
    if (breadcrumbs.length === 0) {
      navigation.goBack();
      return;
    }

    const newBreadcrumbs = [...breadcrumbs];
    newBreadcrumbs.pop();
    setBreadcrumbs(newBreadcrumbs);

    if (newBreadcrumbs.length === 0) {
      loadMainCategories();
    } else {
      const lastParent = newBreadcrumbs[newBreadcrumbs.length - 1];
      loadSubCategories(lastParent.id || lastParent._id);
    }
  };

  const toggleService = (service: any) => {
    const serviceId = service.id || service._id;
    const isSelected = selectedServices.includes(serviceId);

    if (isSelected) {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
      setSelectedServiceObjects(prev => prev.filter(s => (s.id || s._id) !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, serviceId]);
      setSelectedServiceObjects(prev => [...prev, {
        id: serviceId,
        name: service.name,
        icon: service.icon,
        color: service.color,
        basePrice: service.basePrice,
        image: service.image,
        active: true
      }]);
    }
  };

  const handleSelectAll = () => {
    // Gather ALL child services from tree
    let allServices: any[] = [];
    fullCategoryTree.forEach(main => {
      main.subCategories?.forEach((sub: any) => {
        sub.children?.forEach((child: any) => {
          allServices.push(child);
        });
      });
    });

    const allIds = allServices.map(s => s.id || s._id);

    // If all are selected, deselect all. Otherwise select all.
    const allSelected = allIds.every(id => selectedServices.includes(id));

    if (allSelected) {
      setSelectedServices([]);
      setSelectedServiceObjects([]);
    } else {
      setSelectedServices(allIds);
      // Set objects properly
      const objs = allServices.map(service => ({
        id: service.id || service._id,
        name: service.name,
        icon: service.icon,
        color: service.color,
        basePrice: service.basePrice,
        image: service.image,
        active: true
      }));
      setSelectedServiceObjects(objs);
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(updateVendorServices(selectedServiceObjects)).unwrap();
      navigation.navigate('MainTabs', {
        screen: 'Services',
        params: { addedServiceIds: selectedServices },
      });
    } catch (error) {
      console.error('Failed to save services:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentTitle = () => {
    if (breadcrumbs.length === 0) return 'Select Category';
    if (breadcrumbs.length === 1) return 'Select Sub-Category';
    return 'Select Services';
  };

  const getCurrentSubtitle = () => {
    if (breadcrumbs.length === 0) return 'Choose a main category';
    if (breadcrumbs.length === 1) return `Choose a sub-category in ${breadcrumbs[0].name}`;
    return `Select services in ${breadcrumbs[1].name}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // --- WEB RENDER (GRID + SIDEBAR) ---
  if (Platform.OS === 'web') {
    return (
      <View style={styles.web_container}>
        <View style={styles.web_header}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.web_headerGradient}>
            <View style={styles.web_headerContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {breadcrumbs.length > 0 && (
                  <IconButton
                    icon="arrow-left"
                    iconColor="white"
                    size={28}
                    onPress={handleBack}
                    style={{ marginLeft: -12, marginRight: 8 }}
                  />
                )}
                <Title style={[styles.web_headerTitle, { marginBottom: 0 }]}>{getCurrentTitle()}</Title>
              </View>
              <Text style={styles.web_headerSubtitle}>{getCurrentSubtitle()}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.web_contentRow}>
          {/* LEFT: GRID VIEW */}
          <View style={styles.web_leftPanel}>
            <ScrollView style={styles.web_scrollView} contentContainerStyle={styles.web_scrollContent}>
              {currentCategories.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ fontSize: 18, color: '#94a3b8' }}>No categories found.</Text>
                </View>
              ) : (
                <View style={styles.web_gridContainer}>
                  {currentCategories.map(item => {
                    const itemId = item.id || item._id;
                    const isSelected = selectedServices.includes(itemId);
                    const color = item.color || '#6366f1';
                    const isLeaf = breadcrumbs.length >= 2;

                    return (
                      <TouchableOpacity
                        key={itemId}
                        style={[
                          styles.web_gridItem,
                          isLeaf && isSelected && styles.web_gridItemSelected,
                          { borderColor: isLeaf && isSelected ? color : '#e5e7eb' }
                        ]}
                        onPress={() => handleCategoryPress(item)}
                        activeOpacity={0.9}
                      >
                        <View style={[styles.web_iconContainer, { backgroundColor: `${color}15` }]}>
                          {item.image ? (
                            <MaterialCommunityIcons name="image" size={32} color={color} />
                          ) : (
                            <MaterialCommunityIcons name={item.icon as any || 'shape'} size={32} color={color} />
                          )}
                        </View>
                        <Text style={styles.web_serviceName}>{item.name}</Text>

                        {isLeaf ? (
                          <View style={styles.web_checkboxContainer}>
                            <Checkbox
                              status={isSelected ? 'checked' : 'unchecked'}
                              onPress={() => toggleService(item)}
                              color={color}
                            />
                          </View>
                        ) : (
                          <View style={styles.web_checkboxContainer}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>

          {/* RIGHT: SIDEBAR */}
          <View style={styles.web_rightPanel}>
            <View style={styles.web_sidebarHeader}>
              <Text style={styles.web_sidebarTitle}>All Services</Text>
              <Button mode="text" onPress={handleSelectAll} labelStyle={{ fontSize: 14 }}>
                Select All
              </Button>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
              {isLoadingTree ? (
                <ActivityIndicator color="#6366f1" />
              ) : (
                fullCategoryTree.map((main) => (
                  <View key={main.id || main._id} style={{ marginBottom: 20 }}>
                    <Text style={styles.web_treeMain}>{main.name}</Text>
                    {main.subCategories?.map((sub: any) => (
                      <View key={sub.id || sub._id} style={{ marginLeft: 10, marginTop: 8 }}>
                        <Text style={styles.web_treeSub}>{sub.name}</Text>
                        <View style={{ marginLeft: 10 }}>
                          {sub.children?.map((child: any) => {
                            const childId = child.id || child._id;
                            const checked = selectedServices.includes(childId);
                            return (
                              <View key={childId} style={styles.web_treeItem}>
                                <Checkbox.Android
                                  status={checked ? 'checked' : 'unchecked'}
                                  onPress={() => toggleService(child)}
                                  color="#6366f1"
                                />
                                <Text style={{ flex: 1, fontSize: 14 }} onPress={() => toggleService(child)}>
                                  {child.name} {child.basePrice ? `- ₹${child.basePrice}` : ''}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>

        <View style={styles.web_footer}>
          <View style={styles.web_footerContent}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.web_cancelButton}
              textColor="#64748b"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.web_saveButton}
              loading={isSubmitting}
              disabled={selectedServices.length === 0 || isSubmitting}
            >
              Save {selectedServices.length} Services
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // --- MOBILE RENDER (LIST) ---
  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>{getCurrentTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.subtitle}>{getCurrentSubtitle()}</Text>

              {currentCategories.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No categories found.</Text>
                </View>
              ) : (
                currentCategories.map(item => {
                  const itemId = item.id || item._id;
                  const isSelected = selectedServices.includes(itemId);
                  const color = item.color || '#6366f1';
                  const isLeaf = breadcrumbs.length >= 2;

                  return (
                    <TouchableOpacity
                      key={itemId}
                      style={[
                        styles.serviceItem,
                        isLeaf && isSelected && styles.serviceItemSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleCategoryPress(item)}
                    >
                      <View style={[styles.serviceIconCircle, { backgroundColor: `${color}20` }]}>
                        {item.image ? (
                          <MaterialCommunityIcons name="image" size={22} color={color} />
                        ) : (
                          <MaterialCommunityIcons name={item.icon as any || 'shape'} size={22} color={color} />
                        )}
                      </View>
                      <View style={styles.serviceTextWrapper}>
                        <Text style={styles.serviceName}>{item.name}</Text>
                        {isLeaf && (
                          <Text style={styles.serviceHint}>
                            Tap to {isSelected ? 'remove' : 'add'}
                          </Text>
                        )}
                      </View>
                      {isLeaf ? (
                        <Checkbox
                          status={isSelected ? 'checked' : 'unchecked'}
                          onPress={() => toggleService(item)}
                        />
                      ) : (
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.saveButton}
          disabled={selectedServices.length === 0 || isSubmitting}
          loading={isSubmitting}
        >
          Save Selected Services ({selectedServices.length})
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // --- MOBILE STYLES ---
  container: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  card: { elevation: 8, borderRadius: 16 },
  subtitle: { textAlign: 'center', marginBottom: 30, color: '#64748b' },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceItemSelected: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  serviceIconCircle: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  serviceTextWrapper: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  serviceHint: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingHorizontal: 10, paddingBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  saveButton: { backgroundColor: '#6366f1', paddingVertical: 6 },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#94a3b8', fontSize: 16 },

  // --- WEB STYLES ---
  web_container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  web_header: { height: 120, width: '100%', flexShrink: 0 },
  web_headerGradient: { flex: 1, justifyContent: 'center', paddingHorizontal: 40 },
  web_headerContent: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  web_headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  web_headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },

  web_contentRow: { flex: 1, flexDirection: 'row', overflow: 'hidden' },
  web_leftPanel: { flex: 1, height: '100%', position: 'relative' },
  web_rightPanel: {
    width: 350, height: '100%', backgroundColor: 'white',
    borderLeftWidth: 1, borderLeftColor: '#e2e8f0',
    display: 'flex', flexDirection: 'column'
  },

  web_sidebarHeader: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  web_sidebarTitle: { fontSize: 18, fontWeight: 'bold' },
  web_treeMain: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  web_treeSub: { fontSize: 15, fontWeight: '600', color: '#475569', marginBottom: 4 },
  web_treeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },

  web_scrollView: { flex: 1, width: '100%' },
  web_scrollContent: { padding: 40, paddingBottom: 120, alignItems: 'center', flexGrow: 1 },
  web_gridContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, maxWidth: 1200, width: '100%',
  },
  web_gridItem: {
    width: 280, height: 180, backgroundColor: 'white', borderRadius: 16,
    padding: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, position: 'relative', cursor: 'pointer',
  } as any,
  web_gridItemSelected: { backgroundColor: '#ffffff', elevation: 4, transform: [{ scale: 1.02 }] },
  web_iconContainer: {
    width: 64, height: 64, borderRadius: 32, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  web_serviceName: { fontSize: 18, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  web_checkboxContainer: { position: 'absolute', top: 12, right: 12 },
  web_footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0',
    paddingVertical: 20, paddingHorizontal: 40, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 8, zIndex: 100,
  },
  web_footerContent: {
    flexDirection: 'row', justifyContent: 'flex-end', maxWidth: 1200,
    width: '100%', alignSelf: 'center', gap: 16,
  },
  web_cancelButton: { borderColor: '#cbd5e1', width: 120 },
  web_saveButton: { backgroundColor: '#6366f1', width: 200 },
});
