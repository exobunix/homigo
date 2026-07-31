import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform, Pressable, Animated, useWindowDimensions } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { api } from '../../services/api';

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
    { id: '12', name: 'Appliance', icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' },
];

const CLEANING_SERVICES = [
    { id: '1', title: 'Full Home/ Move-in Cleaning', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1700129474836-c5b146.jpeg' },
    { id: '2', title: 'Sofa & Carpet Cleaning', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1700204929955-75dd47.jpeg' },
    { id: '3', title: 'Cockroach, Ant & General Pest Control', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1700141859007-d310cd.jpeg' },
    { id: '4', title: 'Bathroom Cleaning', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1700217115195-4b42c0.jpeg' },
    { id: '5', title: 'Kitchen Cleaning', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1700217150690-faf4ec.jpeg' },
];

const APPLIANCE_SERVICES = [
    { id: '1', title: 'AC Service & Repair', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744612474652-7bbbc3.jpeg' },
    { id: '2', title: 'Washing Machine', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744620504925-e5c5e3.jpeg' },
    { id: '3', title: 'Television', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744620497539-f8e4a6.jpeg' },
    { id: '4', title: 'Air Purifier', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744612450249-c04ac0.jpeg' },
    { id: '5', title: 'Laptop', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744620512917-c855be.jpeg' },
    { id: '6', title: 'Air Cooler', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744620493814-5a8c02.jpeg' },
    { id: '7', title: 'Geyser', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_231,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1744620483134-bbbeee.jpeg' },
];

const HOME_REPAIR_SERVICES = [
    { id: '1', title: 'Drill & hang (wall decor)', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1727776710805-0ce8d7.jpeg' },
    { id: '2', title: 'Cupboard hinge installation', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1653892249137-8848bb.png' },
    { id: '3', title: 'Tap repair', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1652172643970-9ad67b.png' },
    { id: '4', title: 'Switchboard/switchbox repair', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1753955184337-185967.jpeg' },
    { id: '5', title: 'Jet spray installation', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1653890923765-57dea3.png' },
    { id: '6', title: 'Decorative lights installation', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1727776699215-9d4d84.jpeg' },
    { id: '7', title: 'Fan repair', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1753955186834-e76cdd.jpeg' },
    { id: '8', title: 'Channel repair', image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_233,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1653893437438-904068.png' },
];

const SPOTLIGHT = [
    { id: '1', title: 'AC Repair', color: '#E0F7FA', icon: 'snow-outline', textColor: '#006064' },
    { id: '2', title: 'Cleaning', color: '#E3F2FD', icon: 'water-outline', textColor: '#0D47A1' },
    { id: '3', title: 'Plumbing', color: '#FFF3E0', icon: 'construct-outline', textColor: '#E65100' },
    { id: '4', title: 'Electrical', color: '#FFF8E1', icon: 'flash-outline', textColor: '#FF6F00' },
    { id: '4', title: 'Electrical', color: '#FFF8E1', icon: 'flash-outline', textColor: '#FF6F00' },
    { id: '5', title: 'Smart Home', color: '#E8F5E9', icon: 'home-outline', textColor: '#1B5E20' },
];

const SALON_SERVICES = [
    { id: 's1', title: 'Hair Services', category: 'Men\'s Salon' },
    { id: 's2', title: 'Skin Care', category: 'Beauty' },
    { id: 's3', title: 'Hair Color', category: 'Salon' },
    { id: 's4', title: 'Salon for Men', category: 'Grooming' },
    { id: 's5', title: 'Massage', category: 'Men\'s Salon' },
];

const FALLBACK_BANNERS = [
    {
        _id: 'fb1',
        title: 'Deep Cleaning Festival',
        description: 'Flat 20% OFF on Full Home Cleaning. Code: CLEAN20',
        image: 'https://t3.ftcdn.net/jpg/02/36/57/44/360_F_236574440_2nE6HY9HHgjxxNFrq741saHUtOneXAYP.jpg?auto=format&fit=crop&w=800&q=80', // Cleaner wiping shelf
        linkType: 'category',
        linkTo: 'Cleaning'
    },
    {
        _id: 'fb2',
        title: 'Summer Ready AC Service',
        description: 'Expert servicing starts at just ₹499. Book Now!',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80', // Technician working
        linkType: 'category',
        linkTo: 'AC Repair'
    },
    {
        _id: 'fb3',
        title: 'Luxury Spa at Home',
        description: 'Premium relaxing therapies starting @ ₹999',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop',
        linkType: 'category',
        linkTo: 'Home Salon'
    }
];

export const WebHome = ({ onNavigate }: { onNavigate: (route: string, params?: any) => void }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [categories, setCategories] = useState<any[]>([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [mostBooked, setMostBooked] = useState<any[]>([]);
    const [cleaningServices, setCleaningServices] = useState<any[]>([]);
    const [applianceServices, setApplianceServices] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [webContent, setWebContent] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

    const offersScrollRef = useRef<ScrollView>(null);
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const mostBookedScrollRef = useRef<ScrollView>(null);
    const [mostBookedIndex, setMostBookedIndex] = useState(0);

    const cleaningScrollRef = useRef<ScrollView>(null);
    const [cleaningScrollIndex, setCleaningScrollIndex] = useState(0);

    const applianceScrollRef = useRef<ScrollView>(null);
    const [applianceScrollIndex, setApplianceScrollIndex] = useState(0);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.length < 2) {
            setSearchSuggestions([]);
            setShowSearchSuggestions(false);
            return;
        }

        const query = text.toLowerCase();
        const results: any[] = [];
        const seenNames = new Set();

        // 1. Categories (API or Static)
        const catsToSearch = categories.length > 0 ? categories : CATEGORIES;
        catsToSearch.forEach(cat => {
            if (cat.name.toLowerCase().includes(query) && !seenNames.has(cat.name)) {
                results.push({ ...cat, type: 'category', searchLabel: cat.name });
                seenNames.add(cat.name);
            }
        });

        // 2. Services (Cleaning)
        CLEANING_SERVICES.forEach(item => {
            if (item.title.toLowerCase().includes(query) && !seenNames.has(item.title)) {
                results.push({ ...item, type: 'service', searchLabel: item.title, category: 'Cleaning' });
                seenNames.add(item.title);
            }
        });
        // 3. Services (Appliance)
        APPLIANCE_SERVICES.forEach(item => {
            if (item.title.toLowerCase().includes(query) && !seenNames.has(item.title)) {
                results.push({ ...item, type: 'service', searchLabel: item.title, category: 'Appliance Repair' });
                seenNames.add(item.title);
            }
        });
        // 4. Services (Home Repair)
        HOME_REPAIR_SERVICES.forEach(item => {
            if (item.title.toLowerCase().includes(query) && !seenNames.has(item.title)) {
                results.push({ ...item, type: 'service', searchLabel: item.title, category: 'Home Repair' });
                seenNames.add(item.title);
            }
        });



        // 5. Salon Services (Static)
        SALON_SERVICES.forEach(item => {
            if (item.title.toLowerCase().includes(query) && !seenNames.has(item.title)) {
                results.push({ ...item, type: 'service', searchLabel: item.title, category: item.category });
                seenNames.add(item.title);
            }
        });

        setSearchSuggestions(results.slice(0, 6));
        setShowSearchSuggestions(true);
    };

    const handleSelectSuggestion = (item: any) => {
        setSearchQuery(item.searchLabel);
        setShowSearchSuggestions(false);
        if (item.type === 'category') {
            onNavigate('category', { categoryId: item.id || item._id, categoryName: item.name });
        } else {
            onNavigate('category', { categoryName: 'Search Results', searchQuery: item.searchLabel });
        }
    };

    // Helper to map category names to icons
    const getCategoryIcon = (categoryName: string) => {
        const name = categoryName.trim();
        const map: any = {
            'Cleaning': 'https://cdn-icons-png.flaticon.com/512/995/995016.png',
            'Home Cleaning': 'https://cdn-icons-png.flaticon.com/512/995/995016.png',
            'Full Home Cleaning': 'https://cdn-icons-png.flaticon.com/512/995/995016.png',
            'Bathroom Cleaning': 'https://cdn-icons-png.flaticon.com/512/2230/2230582.png',
            'Kitchen Cleaning': 'https://cdn-icons-png.flaticon.com/512/2057/2057484.png',

            'Plumbing': 'https://cdn-icons-png.flaticon.com/512/2942/2942076.png',
            'Plumber': 'https://cdn-icons-png.flaticon.com/512/2942/2942076.png',

            'Electrical': 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
            'Electrician': 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',

            'Painting': 'https://cdn-icons-png.flaticon.com/512/2972/2972106.png',
            'Painters': 'https://cdn-icons-png.flaticon.com/512/2972/2972106.png',

            'Carpentry': 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
            'Carpenter': 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',

            'AC Repair': 'https://cdn-icons-png.flaticon.com/512/911/911409.png',
            'AC Service': 'https://cdn-icons-png.flaticon.com/512/911/911409.png',
            'Air Conditioner': 'https://cdn-icons-png.flaticon.com/512/911/911409.png',

            'Appliance Repair': 'https://cdn-icons-png.flaticon.com/512/1261/1261106.png',
            'Appliances': 'https://cdn-icons-png.flaticon.com/512/1261/1261106.png',
            'Appliance': 'https://cdn-icons-png.flaticon.com/512/1261/1261106.png',

            'Pest Control': 'https://cdn-icons-png.flaticon.com/512/2829/2829823.png',

            'Home Salon': 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png',
            'Salon': 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png',
            'Beauty': 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png',

            'Salon for Women': 'https://cdn-icons-png.flaticon.com/512/2922/2922561.png',
            'Women\'s Salon': 'https://cdn-icons-png.flaticon.com/512/2922/2922561.png',
            'Spa for Women': 'https://cdn-icons-png.flaticon.com/512/2922/2922561.png',

            'Salon for Men': 'https://cdn-icons-png.flaticon.com/512/2640/2640742.png',
            'Men\'s Salon': 'https://cdn-icons-png.flaticon.com/512/2640/2640742.png',
            'Men\'s Grooming': 'https://cdn-icons-png.flaticon.com/512/2640/2640742.png',
            'Massage for Men': 'https://cdn-icons-png.flaticon.com/512/2640/2640742.png',

            'Gardening': 'https://cdn-icons-png.flaticon.com/512/1518/1518965.png',
            'Car Wash': 'https://cdn-icons-png.flaticon.com/512/2312/2312950.png',
            'Laundry': 'https://cdn-icons-png.flaticon.com/512/2982/2982676.png',
            'Packers & Movers': 'https://cdn-icons-png.flaticon.com/512/713/713311.png',
            'Moving and Packing': 'https://cdn-icons-png.flaticon.com/512/713/713311.png',
            'Moving': 'https://cdn-icons-png.flaticon.com/512/713/713311.png',
            'Disinfection': 'https://cdn-icons-png.flaticon.com/512/2954/2954888.png',
            'Disinfection Services': 'https://cdn-icons-png.flaticon.com/512/2954/2954888.png',
            'Smart Home': 'https://cdn-icons-png.flaticon.com/512/2907/2907253.png',
        };
        return map[name] || 'https://cdn-icons-png.flaticon.com/512/1000/1000997.png';
    };

    // Auto-slide banners
    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentOfferIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % banners.length;
                offersScrollRef.current?.scrollTo({ x: nextIndex * 320, animated: true });
                return nextIndex;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [banners.length]);

    // Auto-slide cleaning services
    useEffect(() => {
        if (cleaningServices.length === 0) return;
        const interval = setInterval(() => {
            setCleaningScrollIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % cleaningServices.length;
                cleaningScrollRef.current?.scrollTo({ x: nextIndex * 246, animated: true });
                return nextIndex;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [cleaningServices]);

    // Auto-slide appliance services
    useEffect(() => {
        if (applianceServices.length === 0) return;
        const interval = setInterval(() => {
            setApplianceScrollIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % applianceServices.length;
                applianceScrollRef.current?.scrollTo({ x: nextIndex * 246, animated: true });
                return nextIndex;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [applianceServices]);

    const scrollOffers = (direction: 'left' | 'right') => {
        const newIndex = direction === 'left'
            ? Math.max(0, currentOfferIndex - 1)
            : Math.min(banners.length - 1, currentOfferIndex + 1);
        setCurrentOfferIndex(newIndex);
        offersScrollRef.current?.scrollTo({ x: newIndex * 320, animated: true });
    };

    const scrollMostBooked = (direction: 'left' | 'right') => {
        const cardWidth = 350 + 24; // Width + gap
        const newIndex = direction === 'left'
            ? Math.max(0, mostBookedIndex - 1)
            : Math.min(Math.max(0, mostBooked.length - 3), mostBookedIndex + 1); // Show 3 at a time

        setMostBookedIndex(newIndex);
        mostBookedScrollRef.current?.scrollTo({ x: newIndex * cardWidth, animated: true });
    };

    const handleAddToCart = async (service: any) => {
        try {
            const response = await api.addToCart({
                id: service._id || service.id,
                title: service.name,
                price: service.price,
                image: service.image,
                quantity: 1
            });
            if (response.success) {
                // Navigate to cart to show the added item
                onNavigate('cart');
            } else {
                alert('Failed to add to cart: ' + (response.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Add to cart error:', error);
            if (error.response?.status === 401) {
                alert('Please login to book services');
                onNavigate('login');
            } else {
                alert('Error adding to cart');
            }
        }
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        const fetchBanners = async () => {
            try {
                console.log('🔵 WEB: Fetching banners from API...');
                const response = await api.getBanners();
                console.log('🔵 WEB: Banner API response:', response);
                if (response.success && response.data && response.data.length > 0) {
                    const publishedBanners = response.data.filter(
                        (banner: any) => banner.isActive && banner.position === 'home_top'
                    );

                    if (publishedBanners.length > 0) {
                        console.log('🔵 WEB: Published banners:', publishedBanners.length, publishedBanners);
                        setBanners(publishedBanners);
                    } else {
                        console.log('⚠️ WEB: No published banners found.');
                        setBanners([]);
                    }
                } else {
                    console.log('❌ WEB: No banners from API or empty data');
                    setBanners([]);
                }
            } catch (error) {
                console.error('❌ WEB: Failed to fetch banners:', error);
                setBanners([]);
            }
        };

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

                    // Filter for specific categories
                    const targetCategories = ['AC Repair', 'Car Wash', 'Plumbing', 'Painting'];
                    const filteredServices = services.filter((s: any) => targetCategories.includes(s.category));

                    // Most Booked Logic
                    if (filteredServices.length < 4) {
                        const others = services.filter((s: any) =>
                            !targetCategories.includes(s.category) &&
                            s.category !== 'Electrical' &&
                            s.category !== 'Cleaning'
                        );
                        setMostBooked([...filteredServices, ...others].slice(0, 6));
                    } else {
                        setMostBooked(filteredServices);
                    }

                    // Car Wash & Laundry Services
                    const carLaundryServs = services.filter((s: any) => {
                        const cat = s.category?.toLowerCase() || '';
                        return cat.includes('car') || cat.includes('wash') || cat.includes('laundry') || cat.includes('dry clean');
                    });
                    console.log('🚗 Car & Laundry services found:', carLaundryServs.length, carLaundryServs);
                    setCleaningServices(carLaundryServs);

                    // Appliance Services - more flexible matching
                    const applianceServs = services.filter((s: any) => {
                        const cat = s.category?.toLowerCase() || '';
                        const name = s.name?.toLowerCase() || '';
                        return cat.includes('appliance') || cat.includes('ac') || cat.includes('repair') ||
                            name.includes('appliance') || name.includes('ac service');
                    });
                    console.log('🔧 Appliance services found:', applianceServs.length, applianceServs);
                    setApplianceServices(applianceServs);
                }
            } catch (error) {
                console.error('Failed to fetch home services:', error);
            }
        };

        fetchCategories();

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

        fetchBanners();
        fetchServices();
        fetchTestimonials();

        const fetchWebContent = async () => {
            try {
                const response = await api.getWebContent('home');
                if (response.success && response.data) {
                    // Patch Deep Cleaning Image if broken
                    const patchImage = (obj: any) => {
                        if (!obj) return;
                        if (typeof obj === 'object') {
                            if (obj.title === 'Deep Cleaning' || obj.name === 'Deep Cleaning') {
                                obj.image = 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=800';
                            }
                            if (Array.isArray(obj)) {
                                obj.forEach(patchImage);
                            } else {
                                Object.values(obj).forEach(patchImage);
                            }
                        }
                    };
                    patchImage(response.data);
                    setWebContent(response.data);
                }
            } catch (e) {
                console.log('Error fetching web content', e);
            }
        };
        fetchWebContent();
    }, []);

    return (
        <WebLayout onNavigate={onNavigate}>
            <View style={styles.scrollContent}>
                {/* Banner Carousel - Full Width */}
                {banners.length > 0 && (
                    <View style={styles.topBannerSection}>
                        <View style={styles.bannerCarouselContainer}>
                            <ScrollView
                                ref={offersScrollRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                style={styles.bannerScroll}
                                contentContainerStyle={styles.bannerScrollContent}
                            >
                                {banners.map((banner, index) => (
                                    <Pressable
                                        key={banner._id || index}
                                        style={styles.fullWidthBanner}
                                        onPress={() => {
                                            if (banner.linkType === 'category' && banner.linkTo) {
                                                onNavigate('category', { categoryName: banner.linkTo });
                                            }
                                        }}
                                    >
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            } as any}
                                        />
                                        <View style={styles.fullWidthBannerOverlay}>
                                            <View style={styles.fullWidthBannerContent}>
                                                <Text style={styles.fullWidthBannerTitle}>{banner.title}</Text>
                                                {banner.description && (
                                                    <Text style={styles.fullWidthBannerDescription}>{banner.description}</Text>
                                                )}
                                            </View>
                                        </View>
                                    </Pressable>
                                ))}
                            </ScrollView>
                            {/* Pagination Dots */}
                            <View style={styles.bannerPagination}>
                                {banners.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.bannerDot,
                                            { backgroundColor: index === currentOfferIndex ? colors.white : 'rgba(255,255,255,0.5)' }
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Hero Section */}
                <View style={[styles.heroBackground, { zIndex: 10 }]}>
                    <View style={[styles.heroContainer, {
                        flexDirection: 'row', // Always row, sidebar hidden on mobile
                        paddingTop: isMobile ? 16 : 0,
                        paddingHorizontal: isMobile ? 16 : 32,
                        alignItems: 'center',
                        gap: isMobile ? 12 : 48,
                    }]}>
                        <View style={[styles.heroContent, isMobile && { alignItems: 'center', paddingRight: 0, width: '100%' }]}>
                            <View style={styles.qualityBadge}>
                                <Ionicons name="star" size={14} color={colors.white} />
                                <Text style={styles.qualityBadgeText}>4.8/5 Rated Professionals</Text>
                            </View>
                            <Text style={[styles.heroTitle, isMobile && { fontSize: 32, lineHeight: 40, textAlign: 'center' }]}>
                                {webContent?.hero?.title || "Home services at your doorstep"}
                            </Text>
                            <Text style={[styles.heroSubtitle, isMobile && { fontSize: 16, textAlign: 'center' }]}>
                                {webContent?.hero?.subtitle || "Hygienic, Safe & Insured"}
                            </Text>

                            {/* Mobile Image: Placed after Subtitle */}
                            {isMobile && (
                                <View style={{
                                    width: '100%',
                                    aspectRatio: 1.2,
                                    marginVertical: 8,
                                    backgroundColor: 'transparent'
                                }}>
                                    <Image
                                        source={{ uri: webContent?.hero?.image || 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template,q_auto:low,f_auto/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1696852847761-574450.jpeg' }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}

                            {/* Badges: Hidden on Mobile */}
                            {!isMobile && (
                                <View style={[styles.featuresRow]}>
                                    <View style={styles.featureItem}><Ionicons name="shield-checkmark" size={20} color={colors.success} /><Text style={styles.featureText}>Verified Pros</Text></View>
                                    <View style={styles.featureItem}><Ionicons name="time" size={20} color={colors.success} /><Text style={styles.featureText}>On-Time</Text></View>
                                    <View style={styles.featureItem}><Ionicons name="wallet" size={20} color={colors.success} /><Text style={styles.featureText}>Transparent Pricing</Text></View>
                                </View>
                            )}

                            <View style={[styles.searchBox, isMobile && { width: '100%', padding: 10, height: 48 }, { position: 'relative', zIndex: 1000 }]}>
                                <Ionicons name="search" size={isMobile ? 18 : 24} color={colors.textSecondary} style={styles.searchIcon} />
                                <TextInput
                                    placeholder="Search for 'AC Service', 'Cleaning'..."
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any), isMobile && { fontSize: 14 }]}
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                    onSubmitEditing={(e) => {
                                        setShowSearchSuggestions(false);
                                        onNavigate('category', { categoryName: 'Search Results', searchQuery: searchQuery });
                                    }}
                                />
                                {showSearchSuggestions && searchSuggestions.length > 0 && (
                                    <View style={{
                                        position: 'absolute',
                                        top: isMobile ? 48 : 60,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'white',
                                        borderRadius: 8,
                                        padding: 8,
                                        ...shadows.medium,
                                        zIndex: 1001,
                                        maxHeight: 300,
                                    }}>
                                        {searchSuggestions.map((item, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={{
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 8,
                                                    borderBottomWidth: index === searchSuggestions.length - 1 ? 0 : 1,
                                                    borderBottomColor: colors.border,
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}
                                                onPress={() => handleSelectSuggestion(item)}
                                            >
                                                <Ionicons
                                                    name={item.type === 'category' ? "grid-outline" : "construct-outline"}
                                                    size={18}
                                                    color={colors.textSecondary}
                                                    style={{ marginRight: 12 }}
                                                />
                                                <View>
                                                    <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>{item.searchLabel}</Text>
                                                    {item.type === 'service' && (
                                                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>in {item.category}</Text>
                                                    )}
                                                </View>
                                                <Ionicons name="arrow-forward-circle-outline" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {!isMobile && (
                                <View style={styles.trendingContainer}>
                                    <Text style={styles.trendingLabel}>Trending:</Text>
                                    {['AC Repair', 'Cleaning', 'Painting', 'Salon for Women'].map((tag: string) => (
                                        <TouchableOpacity key={tag} style={styles.trendingTag} onPress={() => onNavigate('category', { categoryName: tag })}>
                                            <Text style={styles.trendingTagText}>{tag}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Desktop Image Sidebar: Hidden on Mobile */}
                        {!isMobile && (
                            <View style={[styles.heroImageContainer]}>
                                <Image
                                    source={{ uri: webContent?.hero?.image || 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template,q_auto:low,f_auto/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/home-screen/1696852847761-574450.jpeg' }}
                                    style={[styles.heroImage]}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface, paddingBottom: spacing.l }, isMobile && { paddingTop: 20 }]}>
                    <Text style={styles.sectionTitle}>All Categories</Text>
                    {isMobile ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingHorizontal: 16 }}>
                            {(showAllCategories ? categories : categories.slice(0, 7)).map((cat) => (
                                <Pressable
                                    key={cat.id || cat._id}
                                    style={{
                                        width: '47%', // Wider card
                                        backgroundColor: '#FFFFFF', // White background
                                        borderRadius: 20, // Rounded corners
                                        paddingVertical: 24, // Taller card
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 8,
                                        elevation: 3,
                                    }}
                                    onPress={() => onNavigate('category', {
                                        categoryId: cat._id || cat.id,
                                        categoryName: cat.name
                                    })}
                                >
                                    <View style={{ marginBottom: 12, width: 56, height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 28 }}>
                                        <Image
                                            source={{ uri: getCategoryIcon(cat.name) }}
                                            style={{ width: 32, height: 32 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            color: colors.text,
                                            lineHeight: 18
                                        }}
                                        numberOfLines={2}
                                    >
                                        {cat.name}
                                    </Text>
                                </Pressable>
                            ))}
                            {!showAllCategories ? (
                                <Pressable
                                    style={{
                                        width: '47%',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 20,
                                        paddingVertical: 24,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 8,
                                        elevation: 3,
                                    }}
                                    onPress={() => setShowAllCategories(true)}
                                >
                                    <View style={{ marginBottom: 12, width: 56, height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 28 }}>
                                        <Ionicons name="apps" size={28} color={colors.primary} />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            color: colors.primary,
                                            lineHeight: 18
                                        }}
                                    >
                                        More
                                    </Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={{
                                        width: '47%',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 20,
                                        paddingVertical: 24,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 8,
                                        elevation: 3,
                                    }}
                                    onPress={() => setShowAllCategories(false)}
                                >
                                    <View style={{ marginBottom: 12, width: 56, height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 28 }}>
                                        <Ionicons name="chevron-up" size={28} color={colors.primary} />
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            color: colors.primary,
                                            lineHeight: 18
                                        }}
                                    >
                                        Show Less
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    ) : (
                        <View style={styles.gridContainer}>
                            {(showAllCategories ? categories : categories.slice(0, 11)).map((cat) => (
                                <Pressable
                                    key={cat.id || cat._id}
                                    style={({ hovered }: any) => [
                                        styles.categoryCard,
                                        hovered && styles.cardHover
                                    ]}
                                    onPress={() => onNavigate('category', {
                                        categoryId: cat._id || cat.id,
                                        categoryName: cat.name
                                    })}
                                >
                                    <View style={styles.categoryIconContainer}>
                                        <Image
                                            source={{ uri: getCategoryIcon(cat.name) }}
                                            style={styles.categoryIcon}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                </Pressable>
                            ))}
                            {!showAllCategories && categories.length > 11 && (
                                <Pressable
                                    style={({ hovered }: any) => [
                                        styles.categoryCard,
                                        hovered && styles.cardHover
                                    ]}
                                    onPress={() => setShowAllCategories(true)}
                                >
                                    <View style={styles.categoryIconContainer}>
                                        <Ionicons name="apps-outline" size={28} color={colors.primary} />
                                    </View>
                                    <Text style={styles.categoryName}>More</Text>
                                </Pressable>
                            )}
                            {showAllCategories && (
                                <Pressable
                                    style={({ hovered }: any) => [
                                        styles.categoryCard,
                                        hovered && styles.cardHover
                                    ]}
                                    onPress={() => setShowAllCategories(false)}
                                >
                                    <View style={styles.categoryIconContainer}>
                                        <Ionicons name="chevron-up-outline" size={28} color={colors.primary} />
                                    </View>
                                    <Text style={styles.categoryName}>Less</Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>

                {/* Spotlight Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>In the Spotlight</Text>
                    {isMobile ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingHorizontal: 16 }}>
                            {(webContent?.spotlight?.length > 0 ? webContent.spotlight : SPOTLIGHT).map((item: any) => (
                                <Pressable
                                    key={item.id}
                                    style={[
                                        styles.spotlightCard,
                                        { backgroundColor: item.color, width: '45%', height: 160, padding: 12 },
                                    ]}
                                    onPress={() => onNavigate('category', { categoryName: item.title })}
                                >
                                    <View style={[styles.spotlightIconContainer, { width: 44, height: 44, borderRadius: 22 }]}>
                                        <Ionicons name={item.icon as any} size={24} color={item.textColor} />
                                    </View>
                                    <View>
                                        <Text style={[styles.spotlightTitle, { color: item.textColor, fontSize: 16 }]}>{item.title}</Text>
                                        <Text style={[styles.spotlightLink, { color: item.textColor, fontSize: 12 }]}>Book Now &gt;</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.spotlightContainer}>
                            {(webContent?.spotlight?.length > 0 ? webContent.spotlight : SPOTLIGHT).map((item: any) => (
                                <Pressable
                                    key={item.id}
                                    style={({ hovered }: any) => [
                                        styles.spotlightCard,
                                        { backgroundColor: item.color },
                                        hovered && styles.cardHover
                                    ]}
                                    onPress={() => onNavigate('category', { categoryName: item.title })}
                                >
                                    <View style={styles.spotlightIconContainer}>
                                        <Ionicons name={item.icon as any} size={28} color={item.textColor} />
                                    </View>
                                    <View>
                                        <Text style={[styles.spotlightTitle, { color: item.textColor }]}>{item.title}</Text>
                                        <Text style={[styles.spotlightLink, { color: item.textColor }]}>Book Now &gt;</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Offers & Discounts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Offers & Discounts</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllLink, { color: colors.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.offersWrapper}>
                        <TouchableOpacity
                            style={[styles.offerArrow, styles.offerArrowLeft]}
                            onPress={() => scrollOffers('left')}
                        >
                            <Ionicons name="chevron-back" size={24} color={colors.black} />
                        </TouchableOpacity>

                        <ScrollView
                            ref={offersScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.offersContainer}
                            style={styles.offersScroll}
                        >
                            {/* Combine Real Banners + Fallback to ensure at least 3 items */}
                            {[...banners, ...FALLBACK_BANNERS].slice(0, Math.max(3, banners.length)).map((banner, index) => (
                                <Pressable
                                    key={banner._id || `fallback-${index}`}
                                    style={({ hovered }: any) => [
                                        styles.offerCard,
                                        hovered && styles.offerCardHover
                                    ]}
                                    onPress={() => {
                                        if (banner.linkType === 'category' && banner.linkTo) {
                                            onNavigate('category', { categoryName: banner.linkTo });
                                        }
                                    }}
                                >
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        } as any}
                                    />
                                    <View style={styles.bannerOverlay}>
                                        <Text style={styles.bannerText}>{banner.title}</Text>
                                        {banner.description && (
                                            <Text style={[styles.bannerText, { fontSize: 14, marginTop: 4 }]}>{banner.description}</Text>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.offerArrow, styles.offerArrowRight]}
                            onPress={() => scrollOffers('right')}
                        >
                            <Ionicons name="chevron-forward" size={24} color={colors.black} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Most Booked Services */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Most Booked Services</Text>
                        <View style={{ flexDirection: 'row', gap: spacing.s }}>
                            <TouchableOpacity
                                style={[styles.offerArrow, { position: 'relative', top: 0, marginTop: 0, width: 32, height: 32 }]}
                                onPress={() => scrollMostBooked('left')}
                            >
                                <Ionicons name="chevron-back" size={20} color={colors.black} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.offerArrow, { position: 'relative', top: 0, marginTop: 0, width: 32, height: 32 }]}
                                onPress={() => scrollMostBooked('right')}
                            >
                                <Ionicons name="chevron-forward" size={20} color={colors.black} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.offersWrapper}>
                        <ScrollView
                            ref={mostBookedScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.servicesGrid}
                            style={styles.offersScroll}
                        >
                            {mostBooked.map((item) => (
                                <View key={item.id} style={styles.serviceCardWrapper}>
                                    <ServiceCard
                                        title={item.name}
                                        rating={item.rating || 4.8}
                                        price={`₹${item.price}`}
                                        image={item.image || 'https://via.placeholder.com/150'}
                                        style={styles.serviceCard}
                                        variant="vertical"
                                        onPress={() => onNavigate('service-details', { service: item })}
                                        onBook={() => handleAddToCart(item)}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Why Choose Us */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, isMobile && { fontSize: 28, marginBottom: spacing.l }]}>Why Homigo?</Text>
                    <View style={[styles.whyChooseContainer, isMobile && { flexDirection: 'column', alignItems: 'center', gap: spacing.l }]}>
                        {(webContent?.whyChooseUs?.length > 0 ? webContent.whyChooseUs : [
                            { title: 'Transparent Pricing', text: 'See fixed prices before you book. No hidden charges.', icon: 'https://cdn-icons-png.flaticon.com/512/2910/2910795.png' },
                            { title: 'Verified Professionals', text: 'Our professionals are background checked and trained.', icon: 'https://cdn-icons-png.flaticon.com/512/1161/1161388.png' },
                            { title: 'Insured Work', text: 'We provide insurance coverage for every service.', icon: 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png' }
                        ]).map((item: any, idx: number) => (
                            <View key={idx} style={styles.whyChooseItem}>
                                <Image source={{ uri: item.icon }} style={styles.whyChooseIcon} />
                                <Text style={styles.whyChooseTitle}>{item.title}</Text>
                                <Text style={styles.whyChooseText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Cleaning & Pest Control Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Car Wash & Laundry</Text>
                    </View>
                    <View style={styles.offersWrapper}>
                        <ScrollView
                            ref={cleaningScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.l, gap: spacing.l }}
                            style={{ width: '100%' }}
                        >
                            {cleaningServices.map((item) => (
                                <Pressable
                                    key={item.id}
                                    style={({ hovered }: any) => [
                                        { width: 230, marginRight: spacing.m },
                                        hovered && { transform: [{ scale: 1.02 }] }
                                    ]}
                                    onPress={() => onNavigate('service-details', { service: item })}
                                >
                                    <View style={{ height: 170, borderRadius: borderRadius.m, overflow: 'hidden', marginBottom: spacing.s }}>
                                        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    </View>
                                    <Text style={{ ...typography.bodyBold, fontSize: 16 }}>{item.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Painting Banner */}
                <View style={[styles.section, { paddingVertical: spacing.l }]}>
                    <View style={{
                        width: '100%',
                        maxWidth: 1200,
                        aspectRatio: 3 / 1,
                        borderRadius: borderRadius.l,
                        overflow: 'hidden',
                        ...shadows.medium, // Add shadow for depth
                    }}>
                        <Image
                            source={{ uri: webContent?.paintingBanner?.image || 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1735893886310-6dbc53.jpeg' }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* How it Works */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isMobile && { fontSize: 28, marginBottom: spacing.l }]}>How it works</Text>
                    {isMobile ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.l, gap: spacing.l }} style={{ width: '100%', marginTop: spacing.l }}>
                            <View style={[styles.stepItem, { width: 280, backgroundColor: colors.white, padding: spacing.l, borderRadius: borderRadius.l, ...shadows.small }]}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name="search" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>Choose a Service</Text>
                                <Text style={styles.stepText}>Select from over 50+ services.</Text>
                            </View>
                            <View style={[styles.stepItem, { width: 280, backgroundColor: colors.white, padding: spacing.l, borderRadius: borderRadius.l, ...shadows.small }]}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name="calendar" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>Pick a Slot</Text>
                                <Text style={styles.stepText}>Choose a time that works for you.</Text>
                            </View>
                            <View style={[styles.stepItem, { width: 280, backgroundColor: colors.white, padding: spacing.l, borderRadius: borderRadius.l, ...shadows.small }]}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name="happy" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>Enjoy Service</Text>
                                <Text style={styles.stepText}>Our professional will do the rest.</Text>
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.stepsContainer}>
                            <View style={styles.stepItem}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name="search" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>Choose a Service</Text>
                                <Text style={styles.stepText}>Select from over 50+ services.</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={styles.stepItem}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name="calendar" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>Pick a Slot</Text>
                                <Text style={styles.stepText}>Choose a time that works for you.</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={styles.stepItem}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name="happy" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>Enjoy Service</Text>
                                <Text style={styles.stepText}>Our professional will do the rest.</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Flash Sale Banner */}
                {
                    (webContent?.flashSale?.isActive !== false) && (
                        <View style={[styles.section, { paddingVertical: 0, marginTop: spacing.xxl }]}>
                            <View style={[styles.flashSaleCard, { backgroundColor: colors.primary, justifyContent: 'center' }, isMobile && { flexDirection: 'column', padding: spacing.l }]}>
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <View style={styles.saleTag}>
                                        <Text style={styles.saleTagText}>FLASHSALE</Text>
                                    </View>
                                    <Text style={[styles.flashSaleTitle, { color: colors.white, textAlign: 'center' }, isMobile && { fontSize: 32 }]}>{webContent?.flashSale?.title || "Save up to 50%"}</Text>
                                    <Text style={[styles.flashSaleSubtitle, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }, isMobile && { fontSize: 16 }]}>{webContent?.flashSale?.subtitle || "On your first Home Cleaning booking"}</Text>
                                    <View style={styles.timerContainer}>
                                        <Ionicons name="time-outline" size={16} color={colors.white} />
                                        <Text style={[styles.flashSaleOffer, { color: colors.white }]}> Ends in 02:14:30</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                }

                {/* Appliance Service & Repair Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Appliance Service & Repair</Text>
                    </View>
                    <View style={styles.offersWrapper}>
                        <ScrollView
                            ref={applianceScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.l, gap: spacing.l }}
                            style={{ width: '100%' }}
                        >
                            {applianceServices.map((item) => (
                                <Pressable
                                    key={item.id}
                                    style={({ hovered }: any) => [
                                        { width: 230, marginRight: spacing.m },
                                        hovered && { transform: [{ scale: 1.02 }] }
                                    ]}
                                    onPress={() => onNavigate('service-details', { service: item })}
                                >
                                    <View style={{ height: 170, borderRadius: borderRadius.m, overflow: 'hidden', marginBottom: spacing.s }}>
                                        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    </View>
                                    <Text style={{ ...typography.bodyBold, fontSize: 16 }}>{item.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* App Download Section */}
                <View style={styles.section}>
                    <View style={[styles.appDownloadCard, isMobile && { flexDirection: 'column', height: 'auto' }]}>
                        <View style={[styles.appDownloadContent, isMobile && { padding: spacing.l }]}>
                            <Text style={[styles.appDownloadTitle, isMobile && { fontSize: 28, textAlign: 'center' }]}>Experience the best of Homigo</Text>
                            <Text style={[styles.appDownloadSubtitle, isMobile && { fontSize: 16, textAlign: 'center' }]}>Get the app for exclusive deals and faster booking.</Text>
                            <View style={[styles.storeButtons, isMobile && { justifyContent: 'center', flexWrap: 'wrap' }]}>
                                <TouchableOpacity style={styles.storeButton}>
                                    <Ionicons name="logo-apple" size={24} color={colors.white} />
                                    <View>
                                        <Text style={styles.storeButtonSmallText}>Download on the</Text>
                                        <Text style={styles.storeButtonLargeText}>App Store</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.storeButton}>
                                    <Ionicons name="logo-google-playstore" size={24} color={colors.white} />
                                    <View>
                                        <Text style={styles.storeButtonSmallText}>GET IT ON</Text>
                                        <Text style={styles.storeButtonLargeText}>Google Play</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?w=600&q=80' }}
                            style={[styles.appDownloadImage, isMobile && { height: 300, width: '100%' }]}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Customer Reviews */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What our customers say</Text>
                    <View style={styles.reviewsContainer}>
                        {testimonials.length > 0 ? (
                            testimonials.map((review) => (
                                <View key={review._id} style={styles.reviewCard}>
                                    <View style={{ position: 'absolute', top: -20, left: 20, backgroundColor: colors.primary, borderRadius: 20, padding: 8 }}>
                                        <Ionicons name="chatbubble" size={24} color={colors.white} />
                                    </View>
                                    <Text style={styles.reviewText}>"{review.message}"</Text>
                                    <View style={styles.reviewFooter}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.m }}>
                                            {review.image ? (
                                                <Image source={{ uri: review.image }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                            ) : (
                                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>
                                                        {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                                                    </Text>
                                                </View>
                                            )}
                                            <View>
                                                <Text style={styles.reviewerName}>{review.name}</Text>
                                                <Text style={styles.reviewDate}>{review.role || 'Customer'}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Ionicons key={i} name={i < review.rating ? "star" : "star-outline"} size={16} color="#FFB400" />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ padding: 20, color: colors.textSecondary }}>No reviews yet.</Text>
                        )}
                    </View>
                </View>

            </View >
        </WebLayout >
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl,
        backgroundColor: colors.background,
    },
    // Top Banner Styles
    topBannerSection: {
        width: '100%',
        backgroundColor: colors.background,
    },
    bannerCarouselContainer: {
        width: '100%',
        alignSelf: 'center',
        position: 'relative',
        height: 500, // Increased height as per request
    },
    bannerScroll: {
        width: '100%',
        height: '100%',
    },
    bannerScrollContent: {
        alignItems: 'center',
    },
    fullWidthBanner: {
        width: Dimensions.get('window').width, // Use Dimensions to match viewport
        height: '100%',
        position: 'relative',
        backgroundColor: '#222',
        overflow: 'hidden',
    },
    fullWidthBannerImage: {
        width: '100%',
        height: '100%',
    },
    fullWidthBannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Fixed: used backgroundColor instead of background
        padding: spacing.xxl,
        paddingBottom: spacing.xxl + spacing.l, // Extra padding for dots
    },
    fullWidthBannerContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: spacing.l,
    },
    fullWidthBannerTitle: {
        fontSize: 56, // Larger title
        fontWeight: '800',
        color: colors.white,
        marginBottom: spacing.s,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    fullWidthBannerDescription: {
        fontSize: 24,
        color: colors.white,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        maxWidth: 800,
    },
    bannerPagination: {
        position: 'absolute',
        bottom: spacing.l,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.m,
    },
    bannerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    heroBackground: {
        backgroundColor: '#F5F5F5', // Subtle gradient-like background
        width: '100%',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    heroContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Centered content
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        paddingHorizontal: spacing.l,
        gap: spacing.xl,
    },
    heroContent: {
        flex: 1,
        alignItems: 'flex-start', // Align left for text prominence
        paddingRight: spacing.xl,
    },
    qualityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.black,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.s,
        borderRadius: borderRadius.s,
        marginBottom: spacing.m,
        gap: spacing.xs,
    },
    qualityBadgeText: {
        ...typography.small,
        color: colors.white,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 56, // Larger
        fontWeight: '800',
        marginBottom: spacing.s,
        color: colors.black,
        lineHeight: 64, // Larger line height
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 24,
        color: colors.textSecondary,
        marginBottom: spacing.l,
        fontWeight: '400',
    },
    featuresRow: {
        flexDirection: 'row',
        gap: spacing.l,
        marginBottom: spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
        backgroundColor: colors.surface,
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
    },
    featureText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    heroImageContainer: {
        flex: 1,
        height: 500, // Larger height
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        position: 'relative',
        ...shadows.large,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', // Darker for better contrast
        padding: spacing.l, // More padding
        paddingBottom: spacing.l + 4,
    },
    bannerText: {
        ...typography.h3, // Larger text
        color: colors.white,
        fontSize: 18, // Larger title
    },
    pagination: {
        position: 'absolute',
        bottom: spacing.l,
        right: spacing.l,
        flexDirection: 'row',
        gap: spacing.s,
    },
    paginationDot: {
        width: 8, // Smaller dots
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
    },
    activeDot: {
        backgroundColor: colors.white,
        width: 24, // Wider active dot
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.m,
        borderRadius: borderRadius.l,
        width: '100%',
        maxWidth: 600, // Wider
        ...shadows.large, // Stronger shadow
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: spacing.m,
    },
    searchInput: {
        flex: 1,
        fontSize: 18, // Larger font
        color: colors.text,
        height: 30,
    },
    trendingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.m,
        flexWrap: 'wrap',
        gap: spacing.s,
    },
    trendingLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginRight: spacing.xs,
    },
    trendingTag: {
        backgroundColor: colors.surface,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        borderColor: colors.border,
    },
    trendingTagText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '500',
    },
    flashSaleCard: {
        borderRadius: borderRadius.xl, // More rounded
        padding: spacing.xl, // More padding
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.medium,
        width: '100%',
        maxWidth: 1200,
    },
    saleTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        alignSelf: 'center',
        marginBottom: spacing.s,
    },
    saleTagText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    flashSaleTitle: {
        ...typography.h1, // Larger title
        marginBottom: spacing.xs,
    },
    flashSaleSubtitle: {
        ...typography.body,
        color: 'rgba(255,255,255,0.9)', // Slightly lighter
        marginBottom: spacing.m,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    flashSaleOffer: {
        ...typography.bodyBold,
    },
    flashSaleButton: {
        paddingVertical: spacing.m, // More padding
        paddingHorizontal: spacing.xl, // More padding
        borderRadius: borderRadius.m,
        ...shadows.small,
    },
    flashSaleButtonText: {
        ...typography.bodyBold,
        fontSize: 16, // Larger text
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align top to handle different text heights
        marginTop: spacing.xl,
        width: '100%',
        maxWidth: 1000,
        position: 'relative', // For absolute positioning of lines if needed
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
        zIndex: 1, // Keep above line
    },
    stepIconBg: {
        width: 80, // Larger
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface, // Light background
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        ...shadows.medium,
        borderWidth: 4,
        borderColor: colors.white, // White border for separation
    },
    stepTitle: {
        ...typography.h3,
        textAlign: 'center',
        marginBottom: spacing.s,
        color: colors.text,
    },
    stepText: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textSecondary,
        maxWidth: 200, // Limit text width for better readability
    },
    stepLine: {
        height: 2,
        flex: 1,
        backgroundColor: colors.border,
        marginTop: 40, // Align with center of icon (80/2)
        marginHorizontal: -20, // Overlap slightly
    },
    whyChooseContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: spacing.l,
        width: '100%',
        maxWidth: 1000,
        gap: spacing.xl,
    },
    whyChooseItem: {
        alignItems: 'center',
        flex: 1,
        padding: spacing.l,
    },
    whyChooseIcon: {
        width: 64,
        height: 64,
        marginBottom: spacing.m,
    },
    whyChooseTitle: {
        ...typography.h3,
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    whyChooseText: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textSecondary,
    },
    section: {
        paddingVertical: spacing.xxl,
        alignItems: 'center',
        width: '100%',
    },
    sectionTitle: {
        ...typography.h2,
        fontSize: 36, // Even larger
        marginBottom: spacing.xxl,
        textAlign: 'center',
        fontWeight: '800',
    },
    spotlightContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.l,
        flexWrap: 'wrap',
        maxWidth: 1200,
    },
    spotlightCard: {
        width: 200, // Wider
        height: 220, // Taller
        borderRadius: borderRadius.l,
        padding: spacing.l,
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align text left
        ...shadows.small,
        cursor: 'pointer',
    },
    spotlightIconContainer: {
        width: 60, // Larger icon container
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    spotlightTitle: {
        ...typography.h3,
        fontSize: 20, // Larger title
        textAlign: 'left', // Align left
        marginBottom: spacing.xs,
    },
    spotlightLink: {
        ...typography.bodyBold,
        fontSize: 14,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.xl,
        maxWidth: 1200,
        paddingHorizontal: spacing.l,
    },
    categoryCard: {
        alignItems: 'center',
        padding: spacing.l,
        backgroundColor: colors.white,
        borderRadius: borderRadius.l,
        width: 150, // Slightly wider
        // borderWidth: 1, // Removed border
        // borderColor: colors.border,
        ...shadows.small,
        cursor: 'pointer',
    },
    cardHover: {
        transform: [{ scale: 1.05 }],
        ...shadows.medium,
        zIndex: 1,
    },
    categoryIconContainer: {
        width: 70, // Larger circle
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.surface, // Background circle
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    categoryIcon: {
        width: 40, // Smaller icon inside circle
        height: 40,
    },
    categoryName: {
        ...typography.bodyBold,
        textAlign: 'center',
        color: colors.text,
    },
    servicesGrid: {
        flexDirection: 'row',
        // flexWrap: 'wrap', // Disabled for slider
        // justifyContent: 'center',
        gap: spacing.l,
        maxWidth: 1200,
    },
    serviceCardWrapper: {
        width: 350,
    },
    serviceCard: {
        width: '100%',
        maxWidth: '90vw' as any,
        // borderWidth: 1, // Removed border for cleaner look
        // borderColor: colors.border,
    },
    reviewsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xl, // More gap
        flexWrap: 'wrap',
        maxWidth: 1200,
    },
    reviewCard: {
        width: 360,
        maxWidth: '85vw' as any, // Responsive constraint
        padding: spacing.xxl, // More padding
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl, // More rounded
        // borderWidth: 1, // Removed border
        // borderColor: colors.border,
        ...shadows.medium, // Stronger shadow
        position: 'relative',
    },
    reviewText: {
        ...typography.body,
        fontSize: 18, // Larger text
        lineHeight: 28, // Better readability
        marginBottom: spacing.xl, // More margin
        color: colors.text,
        fontStyle: 'italic',
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 0, // Removed border
        // borderTopColor: colors.border,
        paddingTop: 0,
    },
    reviewerName: {
        ...typography.bodyBold,
        fontSize: 18,
        color: colors.text,
        marginBottom: 4,
    },
    reviewDate: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 12,
    },
    appDownloadCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 1000,
        height: 400,
        ...shadows.medium,
    },
    appDownloadContent: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    appDownloadTitle: {
        ...typography.h2,
        fontSize: 36,
        marginBottom: spacing.m,
    },
    appDownloadSubtitle: {
        ...typography.body,
        fontSize: 18,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    storeButtons: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    storeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.black,
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
        gap: spacing.s,
    },
    storeButtonSmallText: {
        color: colors.white,
        fontSize: 10,
    },
    storeButtonLargeText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    appDownloadImage: {
        flex: 1,
        height: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        marginBottom: spacing.l,
        paddingHorizontal: spacing.l,
    },
    seeAllLink: {
        ...typography.bodyBold,
        fontSize: 16,
    },
    offersScroll: {
        width: '100%',
    },
    offersWrapper: {
        width: '100%',
        maxWidth: 1200,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offersContainer: {
        paddingHorizontal: spacing.l,
        gap: spacing.l,
        paddingBottom: spacing.m,
    },
    offerArrow: {
        position: 'absolute',
        top: '50%',
        marginTop: -20, // Half of height
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...shadows.medium,
        cursor: 'pointer',
    },
    offerArrowLeft: {
        left: spacing.l,
    },
    offerArrowRight: {
        right: spacing.l,
    },
    offerCard: {
        width: 450,
        maxWidth: '85vw' as any, // Responsive constraint
        height: 250,
        borderRadius: borderRadius.l,
        overflow: 'hidden',
        ...shadows.small,
        backgroundColor: colors.white,
    },
    offerCardHover: {
        transform: [{ scale: 1.02 }],
        ...shadows.medium,
    },
    offerImage: {
        width: '100%',
        height: '100%',
    },
});
