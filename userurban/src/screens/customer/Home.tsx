import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Platform, Dimensions, Alert, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { AppInput } from '../../components/ui/AppInput';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import SocketService from '../../services/SocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'Plumbing', icon: 'https://cdn-icons-png.flaticon.com/512/2942/2942076.png' },
    { id: '2', name: 'Electrical', icon: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png' },
    { id: '3', name: 'Cleaning', icon: 'https://cdn-icons-png.flaticon.com/512/995/995016.png' },
    { id: '4', name: 'Painting', icon: 'https://cdn-icons-png.flaticon.com/512/2972/2972106.png' },
    { id: '5', name: 'Carpentry', icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' },
    { id: '6', name: 'AC Repair', icon: 'https://cdn-icons-png.flaticon.com/512/911/911409.png' },
    { id: '7', name: 'Pest Control', icon: 'https://cdn-icons-png.flaticon.com/512/2829/2829823.png' },
    { id: '8', name: 'Home Salon', icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png' },
    { id: '9', name: 'Gardening', icon: 'https://cdn-icons-png.flaticon.com/512/1518/1518965.png' },
    { id: '10', name: 'Car Wash', icon: 'https://cdn-icons-png.flaticon.com/512/2312/2312950.png' },
    { id: '11', name: 'Laundry', icon: 'https://cdn-icons-png.flaticon.com/512/2982/2982676.png' },
    { id: '12', name: 'Appliance Repair', icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' },
    { id: '13', name: 'Moving & Packing', icon: 'https://cdn-icons-png.flaticon.com/512/713/713311.png' },
    { id: '14', name: 'Disinfection', icon: 'https://cdn-icons-png.flaticon.com/512/2853/2853364.png' },
    { id: '15', name: 'Smart Home', icon: 'https://cdn-icons-png.flaticon.com/512/2907/2907253.png' },
    { id: 'more', name: 'More', icon: 'https://cdn-icons-png.flaticon.com/512/2942/2942924.png' },
];

const SPOTLIGHT = [
    { id: '1', title: 'AC Repair', color: '#E0F7FA', icon: 'snow-outline', textColor: '#006064' },
    { id: '2', title: 'Cleaning', color: '#E3F2FD', icon: 'water-outline', textColor: '#0D47A1' },
    { id: '3', title: 'Plumbing', color: '#FFF3E0', icon: 'construct-outline', textColor: '#E65100' },
    { id: '4', title: 'Electrical', color: '#FFF8E1', icon: 'flash-outline', textColor: '#FF6F00' },
    { id: '5', title: 'Smart Home', color: '#E8F5E9', icon: 'hardware-chip-outline', textColor: '#1B5E20' },
];

const FALLBACK_BANNERS = [
    {
        _id: 'fallback-1',
        title: 'Professional Home Cleaning',
        description: 'Get your home sparkling clean with our top-rated professionals.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
        position: 'home_top',
        isActive: true
    },
    {
        _id: 'fallback-2',
        title: 'Expert AC Repair',
        description: 'Fast and reliable AC service at your doorstep.',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
        position: 'home_top',
        isActive: true
    },
    {
        _id: 'fallback-3',
        title: 'Salon at Home',
        description: 'Premium beauty services in the comfort of your home.',
        image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
        position: 'home_top',
        isActive: true
    }
];

export const Home = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const { location, fullAddress } = useLocation();
    const { addToCart, cartCount } = useCart();
    const { addNotification } = useNotifications();
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [activeBanner, setActiveBanner] = useState(0);
    const bannerRef = useRef<ScrollView>(null);
    const CARD_WIDTH = width * 0.9;
    const CARD_MARGIN = spacing.m;
    const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

    const [mostBooked, setMostBooked] = useState<any[]>([]);
    const [newNoteworthy, setNewNoteworthy] = useState<any[]>([]);
    const [homeRepairs, setHomeRepairs] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState<string>('Select Location');
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);

    const fetchTestimonials = async () => {
        try {
            const response = await api.getTestimonials();
            if (response.success && response.data) {
                setTestimonials(response.data.filter((t: any) => t.active));
            }
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories('main');
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        const fetchServices = async () => {
            try {
                const response = await api.getServices();
                if (response.success && response.data) {
                    const services = response.data;
                    setMostBooked(services.slice(0, 3));
                    setHomeRepairs(services.slice(3, 5));
                    setNewNoteworthy(services.slice(5, 7));
                }
            } catch (error) {
                console.error('Failed to fetch home services:', error);
            }
        };

        const fetchDefaultAddress = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const response = await api.getProfile();
                if (response.success && response.data) {
                    // Backend returns addresses in 'savedAddresses' field
                    const userAddresses = response.data.savedAddresses || response.data.addresses || [];
                    console.log('All user addresses:', JSON.stringify(userAddresses, null, 2));
                    const defaultAddr = userAddresses.find((addr: any) => addr.isDefault);
                    console.log('Default address found:', JSON.stringify(defaultAddr, null, 2));
                    if (defaultAddr) {
                        setSelectedAddress(defaultAddr);
                        setDefaultAddress(defaultAddr.city || defaultAddr.addressLine1);
                    }
                }
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch default address:', error);
                }
            }
        };

        fetchCategories();
        fetchServices();
        fetchTestimonials();
        fetchDefaultAddress();

        const initSocket = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const userStr = await AsyncStorage.getItem('user');
                if (token && userStr) {
                    const user = JSON.parse(userStr);
                    SocketService.setNotificationHandler(addNotification);
                    SocketService.connect(user._id || user.id, token);
                }
            } catch (e) {
                console.log('Socket init error:', e);
            }
        };
        initSocket();

        return () => {
            SocketService.disconnect();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchBanners = async () => {
                try {
                    console.log('🔵 Fetching banners from API (Focus Effect)...');
                    const response = await api.getBanners();
                    if (response.success && response.data) {
                        // Filter only published banners for home_top position
                        const publishedBanners = response.data.filter(
                            (banner: any) => banner.isActive && banner.position === 'home_top'
                        );
                        console.log('🔵 Published home_top banners:', publishedBanners.length);

                        if (publishedBanners.length > 0) {
                            setBanners(publishedBanners);
                        } else {
                            console.log('⚠️ No active banners found, using FALLBACK banners');
                            setBanners(FALLBACK_BANNERS);
                        }
                    } else {
                        console.log('⚠️ API response invalid, using FALLBACK banners');
                        setBanners(FALLBACK_BANNERS);
                    }
                } catch (error) {
                    console.error('❌ Failed to fetch banners:', error);
                    console.log('⚠️ Error fetching, using FALLBACK banners');
                    setBanners(FALLBACK_BANNERS);
                }
            };
            fetchBanners();
        }, [])
    );

    // Refresh default address when screen comes into focus (e.g., returning from ManageAddresses)
    useFocusEffect(
        useCallback(() => {
            const refreshAddress = async () => {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (!token) return;

                    const response = await api.getProfile();
                    if (response.success && response.data) {
                        const userAddresses = response.data.savedAddresses || response.data.addresses || [];
                        const defaultAddr = userAddresses.find((addr: any) => addr.isDefault);
                        if (defaultAddr) {
                            setSelectedAddress(defaultAddr);
                            setDefaultAddress(defaultAddr.city || defaultAddr.addressLine1);
                        }
                    }
                } catch (error: any) {
                    if (error.response?.status !== 401) {
                        console.error('Failed to fetch default address:', error);
                    }
                }
            };
            refreshAddress();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Refresh services
            const response = await api.getServices();
            if (response.success && response.data) {
                const services = response.data;
                setMostBooked(services.slice(0, 3));
                setHomeRepairs(services.slice(3, 5));
                setNewNoteworthy(services.slice(5, 7));
            }

            // Refresh default address
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const profileResponse = await api.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    const userAddresses = profileResponse.data.savedAddresses || profileResponse.data.addresses || [];
                    const defaultAddr = userAddresses.find((addr: any) => addr.isDefault);
                    if (defaultAddr) {
                        setSelectedAddress(defaultAddr);
                        setDefaultAddress(defaultAddr.city || defaultAddr.addressLine1);
                    }
                }
            }

            // Refresh categories
            const catResponse = await api.getCategories('main');
            if (catResponse.success && catResponse.data) {
                setCategories(catResponse.data);
            }
        } catch (error) {
            console.error('Failed to refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (banners.length === 0) return; // Don't start interval if no banners

        const interval = setInterval(() => {
            let nextIndex = activeBanner + 1;
            if (nextIndex >= banners.length) {
                nextIndex = 0;
                bannerRef.current?.scrollTo({ x: 0, animated: true });
            } else {
                bannerRef.current?.scrollTo({
                    x: nextIndex * SNAP_INTERVAL,
                    animated: true
                });
            }
            setActiveBanner(nextIndex);
        }, 3000);

        return () => clearInterval(interval);
    }, [activeBanner, SNAP_INTERVAL, banners.length]);

    const handleAddToCart = (item: any) => {
        let price = item.price;
        if (typeof item.price === 'string') {
            price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        }

        addToCart({
            id: item.id,
            vendorId: item.vendorId,
            title: item.title || item.name,
            price: price,
            image: item.image ? { uri: item.image } : require('../../../assets/icon.png'),
            quantity: 1
        });
    };

    const handleLocationPress = () => {
        if (selectedAddress) {
            const fullAddr = `Type: ${selectedAddress.type}\n\n${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? '\n' + selectedAddress.addressLine2 : ''}\n${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;
            Alert.alert('Selected Address', fullAddr);
        } else {
            Alert.alert('No Address', 'Please add an address in Manage Addresses');
        }
    };

    const handleCategoryPress = (item: any) => {
        if (item.id === 'more') {
            setShowAllCategories(true);
        } else if (item.id === 'less') {
            setShowAllCategories(false);
        } else {
            navigation.navigate('CategoryScreen', {
                categoryId: item.id || item._id,
                categoryName: item.name
            });
        }
    };

    // Hardcoded professional icons for main categories
    const getCategoryIcon = (categoryName: string): string => {
        const name = categoryName.trim().toLowerCase();

        if (name.includes('cleaning') || name.includes('maid')) return 'https://cdn-icons-png.flaticon.com/512/995/995016.png';
        if (name.includes('bathroom')) return 'https://cdn-icons-png.flaticon.com/512/2230/2230582.png';
        if (name.includes('kitchen')) return 'https://cdn-icons-png.flaticon.com/512/2057/2057484.png';

        if (name.includes('plumb')) return 'https://cdn-icons-png.flaticon.com/512/2942/2942076.png';
        if (name.includes('electr')) return 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png';
        if (name.includes('paint')) return 'https://cdn-icons-png.flaticon.com/512/2972/2972106.png';
        if (name.includes('carpen') || name.includes('wood')) return 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png';

        if (name.includes('ac ') || name.includes('air cond')) return 'https://cdn-icons-png.flaticon.com/512/911/911409.png';
        if (name.includes('appliance')) return 'https://cdn-icons-png.flaticon.com/512/1261/1261106.png';

        if (name.includes('pest')) return 'https://cdn-icons-png.flaticon.com/512/2829/2829823.png';

        // Salon logic - specific first
        if (name.includes('women') || name.includes('lady') || name.includes('female')) return 'https://cdn-icons-png.flaticon.com/512/2922/2922561.png';
        if (name.includes('men') || name.includes('gent') || name.includes('male')) return 'https://cdn-icons-png.flaticon.com/512/2640/2640742.png';
        if (name.includes('salon') || name.includes('beauty') || name.includes('spa')) return 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png';

        if (name.includes('garden')) return 'https://cdn-icons-png.flaticon.com/512/1518/1518965.png';
        if (name.includes('car') && name.includes('wash')) return 'https://cdn-icons-png.flaticon.com/512/2312/2312950.png';
        if (name.includes('laundry') || name.includes('dry clean')) return 'https://cdn-icons-png.flaticon.com/512/2982/2982676.png';
        if (name.includes('move') || name.includes('pack')) return 'https://cdn-icons-png.flaticon.com/512/713/713311.png';
        if (name.includes('disinfect') || name.includes('sanitize')) return 'https://cdn-icons-png.flaticon.com/512/2954/2954888.png';
        if (name.includes('smart')) return 'https://cdn-icons-png.flaticon.com/512/2907/2907253.png';

        return 'https://cdn-icons-png.flaticon.com/512/1000/1000997.png';
    };

    const renderCategory = ({ item }: any) => {
        const isAction = item.id === 'more' || item.id === 'less';
        // Use hardcoded professional icons for main categories
        const imageUrl = getCategoryIcon(item.name);

        return (
            <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(item)}
            >
                <View style={[
                    styles.categoryIconContainer,
                    { backgroundColor: isAction ? colors.primary : (isDark ? '#FFFFFF' : colors.surface) }
                ]}>
                    {isAction ? (
                        <Ionicons
                            name={item.id === 'more' ? "grid-outline" : "chevron-up-outline"}
                            size={24}
                            color={"#FFFFFF"}
                        />
                    ) : (
                        <Image source={{ uri: imageUrl }} style={styles.categoryIcon} resizeMode="contain" />
                    )}
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderServiceItem = (item: any, index: number) => (
        <View key={`${item.id || 'service'}-${index}`} style={styles.horizontalCardWrapper}>
            <ServiceCard
                title={item.title || item.name}
                image={item.image ? { uri: item.image } : require('../../../assets/icon.png')}
                rating={item.rating || 4.8}
                price={typeof item.price === 'number' ? `$${item.price}` : item.price}
                onPress={() => navigation.navigate('ServiceDetailsScreen', { service: item })}
                onBook={() => handleAddToCart(item)}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.locationRow} onPress={handleLocationPress}>
                        <Ionicons name="location" size={20} color={colors.primary} />
                        <View style={styles.locationInfo}>
                            <View style={styles.addressRow}>
                                <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                                    {defaultAddress}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('NotificationsScreen')}>
                            <Ionicons name="notifications-outline" size={24} color={colors.text} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('CartScreen')}>
                            <Ionicons name="cart-outline" size={24} color={colors.text} />
                            {cartCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.headerSearch}>
                    <TouchableOpacity
                        style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('SearchScreen')}
                    >
                        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                        <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search for 'AC Repair'</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Banners */}
                {banners.length > 0 ? (
                    <View style={styles.carouselContainer}>
                        <ScrollView
                            ref={bannerRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={SNAP_INTERVAL}
                            decelerationRate="fast"
                            contentContainerStyle={styles.bannerList}
                            onMomentumScrollEnd={(e) => {
                                const newIndex = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                                setActiveBanner(newIndex);
                            }}
                        >
                            {banners.map((item: any, index: number) => (
                                <View key={`${item._id}-${index}`} style={[styles.bannerContainer, { width: CARD_WIDTH, marginRight: CARD_MARGIN }]}>
                                    <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.bannerOverlay}
                                    >
                                        <Text style={styles.bannerText}>{item.title}</Text>
                                        {item.description && (
                                            <Text style={[styles.bannerText, { fontSize: 14, marginTop: 4 }]}>{item.description}</Text>
                                        )}
                                    </LinearGradient>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.pagination}>
                            {banners.map((_: any, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        { backgroundColor: index === activeBanner ? colors.primary : colors.border }
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={{ padding: 20, backgroundColor: '#ffeb3b', margin: 16, borderRadius: 8 }}>
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>⚠️ DEBUG: No banners to display (count: {banners.length})</Text>
                        <Text style={{ color: '#000', fontSize: 12 }}>Check console for API response</Text>
                    </View>
                )}

                {/* Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>What are you looking for?</Text>
                    </View>
                    <View style={styles.gridContainer}>
                        {(showAllCategories
                            ? categories
                            : categories.slice(0, 7)
                        ).map((item: any, index) => (
                            <View key={`${item.id || item._id}-${index}`} style={styles.gridItemWrapper}>
                                {renderCategory({ item })}
                            </View>
                        ))}
                        {!showAllCategories && categories.length > 7 && (
                            <View style={styles.gridItemWrapper}>
                                {renderCategory({ item: { id: 'more', name: 'More', icon: 'https://cdn-icons-png.flaticon.com/512/2942/2942924.png' } })}
                            </View>
                        )}
                        {showAllCategories && (
                            <View style={styles.gridItemWrapper}>
                                {renderCategory({ item: { id: 'less', name: 'See Less', icon: '' } })}
                            </View>
                        )}
                    </View>
                </View>

                {/* Spotlight */}
                < View style={styles.section} >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>In the Spotlight</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {SPOTLIGHT.map((item, index) => (
                            <TouchableOpacity
                                key={`${item.id}-${index}`}
                                style={[styles.spotlightCard, { backgroundColor: item.color }]}
                                onPress={() => handleCategoryPress(item.title)}
                            >
                                <View style={[styles.spotlightIconContainer, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
                                    <Ionicons name={item.icon as any} size={24} color={item.textColor} />
                                </View>
                                <Text style={[styles.spotlightTitle, { color: item.textColor }]}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View >

                {/* Most Booked */}
                < View style={styles.section} >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Booked Services</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {mostBooked.map((item, index) => renderServiceItem(item, index))}
                    </ScrollView>
                </View >

                {/* Flash Sale Banner */}
                < View style={styles.section} >
                    <View style={[styles.flashSaleCard, { backgroundColor: colors.primary }]}>
                        <View>
                            <Text style={[styles.flashSaleTitle, { color: colors.white }]}>Flash Sale! ⚡</Text>
                            <Text style={[styles.flashSaleSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Ends in 02:14:30</Text>
                            <Text style={[styles.flashSaleOffer, { color: colors.white }]}>Get 50% OFF on Cleaning</Text>
                        </View>
                        <TouchableOpacity style={[styles.flashSaleButton, { backgroundColor: colors.white }]}>
                            <Text style={[styles.flashSaleButtonText, { color: colors.primary }]}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                </View >

                {/* Home Repairs */}
                < View style={styles.section} >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Home Repairs</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {homeRepairs.map((item, index) => renderServiceItem(item, index))}
                    </ScrollView>
                </View >

                {/* New & Noteworthy */}
                < View style={styles.section} >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>New & Noteworthy</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {newNoteworthy.map((item, index) => renderServiceItem(item, index))}
                    </ScrollView>
                </View >

                {/* Safety Banner */}
                < View style={styles.section} >
                    <View style={[styles.safetyBanner, { backgroundColor: isDark ? colors.surface : colors.surfaceHighlight, borderColor: colors.success }]}>
                        <Ionicons name="shield-checkmark" size={32} color={colors.success} />
                        <View style={styles.safetyContent}>
                            <Text style={[styles.safetyTitle, { color: colors.text }]}>Safety First</Text>
                            <Text style={[styles.safetyText, { color: colors.textSecondary }]}>Verified professionals & strict hygiene protocols.</Text>
                        </View>
                    </View>
                </View >

                {/* How it Works */}
                < View style={styles.section} >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>How it Works</Text>
                    <View style={styles.stepsContainer}>
                        <View style={styles.stepItem}>
                            <View style={[styles.stepIconBg, { backgroundColor: isDark ? colors.surface : colors.surfaceHighlight }]}>
                                <Ionicons name="search" size={24} color={colors.primary} />
                            </View>
                            <Text style={[styles.stepText, { color: colors.text }]}>Choose Service</Text>
                        </View>
                        <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
                        <View style={styles.stepItem}>
                            <View style={[styles.stepIconBg, { backgroundColor: isDark ? colors.surface : colors.surfaceHighlight }]}>
                                <Ionicons name="calendar" size={24} color={colors.primary} />
                            </View>
                            <Text style={[styles.stepText, { color: colors.text }]}>Book Slot</Text>
                        </View>
                        <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
                        <View style={styles.stepItem}>
                            <View style={[styles.stepIconBg, { backgroundColor: isDark ? colors.surface : colors.surfaceHighlight }]}>
                                <Ionicons name="happy" size={24} color={colors.primary} />
                            </View>
                            <Text style={[styles.stepText, { color: colors.text }]}>Enjoy Service</Text>
                        </View>
                    </View>
                </View >

                {/* Customer Reviews */}
                < View style={styles.section} >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>What our customers say</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {testimonials.length > 0 ? (
                            testimonials.map((item, index) => (
                                <View key={item._id || index} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <View style={styles.reviewHeader}>
                                        {item.image ? (
                                            <Image source={{ uri: item.image }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                                        ) : (
                                            <View style={[styles.reviewerAvatar, { backgroundColor: colors.primary }]}>
                                                <Text style={[styles.reviewerInitials, { color: colors.white }]}>
                                                    {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                                                </Text>
                                            </View>
                                        )}
                                        <View>
                                            <Text style={[styles.reviewerName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{item.role || 'Customer'}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.reviewText, { color: colors.textSecondary }]} numberOfLines={3}>"{item.message}"</Text>
                                    <View style={styles.reviewRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons key={i} name={i < item.rating ? "star" : "star-outline"} size={14} color="#FFB400" />
                                        ))}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ padding: 20, color: colors.textSecondary }}>No reviews yet.</Text>
                        )}
                    </ScrollView>
                </View >
            </ScrollView >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        borderBottomWidth: 1,
        paddingBottom: spacing.m,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
    },
    headerSearch: {
        paddingHorizontal: spacing.m,
        marginTop: spacing.s,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationInfo: {
        flex: 1,
        marginLeft: spacing.s,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationLabel: {
        ...typography.caption,
        fontSize: 10,
        marginBottom: 2,
    },
    locationText: {
        ...typography.body,
        fontSize: 15,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: spacing.s,
        position: 'relative',
        marginRight: spacing.xs,
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E91E63',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    cartButton: {
        padding: spacing.s,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#E91E63',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        height: 40,
    },
    searchIcon: {
        marginRight: spacing.s,
    },
    searchPlaceholder: {
        ...typography.body,
    },
    section: {
        marginTop: spacing.l,
        paddingHorizontal: spacing.m,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    sectionTitle: {
        ...typography.h2,
        marginBottom: spacing.m,
    },
    seeAll: {
        ...typography.body,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItemWrapper: {
        width: '23%',
        marginBottom: spacing.l,
    },
    categoryItem: {
        alignItems: 'center',
    },
    categoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    categoryIcon: {
        width: 32,
        height: 32,
    },
    categoryName: {
        ...typography.caption,
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 14,
    },
    carouselContainer: {
        marginTop: spacing.m,
    },
    bannerList: {
        paddingHorizontal: spacing.m,
    },
    bannerContainer: {
        borderRadius: borderRadius.l,
        overflow: 'hidden',
        height: 220, // Increased height for better visibility
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // backgroundColor removed, handled by LinearGradient
        padding: spacing.m,
    },
    bannerText: {
        ...typography.h3,
        color: '#FFFFFF',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.s,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    serviceCard: {
        marginBottom: spacing.m,
        ...shadows.small,
        borderWidth: 1,
    },
    horizontalScroll: {
        marginHorizontal: -spacing.m,
        paddingHorizontal: spacing.m,
    },
    horizontalCardWrapper: {
        width: 320,
        marginRight: spacing.m,
    },
    spotlightCard: {
        width: 140,
        height: 140,
        borderRadius: borderRadius.l,
        padding: spacing.m,
        marginRight: spacing.m,
        justifyContent: 'space-between',
    },
    spotlightIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spotlightTitle: {
        ...typography.h3,
        fontSize: 16,
    },
    flashSaleCard: {
        borderRadius: borderRadius.l,
        padding: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.medium,
    },
    flashSaleTitle: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    flashSaleSubtitle: {
        ...typography.caption,
        marginBottom: spacing.xs,
    },
    flashSaleOffer: {
        ...typography.bodyBold,
        fontSize: 18,
    },
    flashSaleButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
    },
    flashSaleButtonText: {
        ...typography.bodyBold,
    },
    safetyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
    },
    safetyContent: {
        marginLeft: spacing.m,
        flex: 1,
    },
    safetyTitle: {
        ...typography.bodyBold,
    },
    safetyText: {
        ...typography.caption,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.s,
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
    },
    stepIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    stepText: {
        ...typography.caption,
        textAlign: 'center',
        fontWeight: '600',
    },
    stepLine: {
        height: 2,
        flex: 0.5,
        marginBottom: 20,
    },
    reviewCard: {
        width: 280,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginRight: spacing.m,
        borderWidth: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    reviewerInitials: {
        fontWeight: 'bold',
    },
    reviewerName: {
        ...typography.bodyBold,
    },
    reviewDate: {
        ...typography.caption,
        fontSize: 10,
    },
    reviewText: {
        ...typography.body,
        fontStyle: 'italic',
        marginBottom: spacing.s,
    },
    reviewRating: {
        flexDirection: 'row',
    },
});
