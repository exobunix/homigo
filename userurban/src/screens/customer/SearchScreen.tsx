import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { api } from '../../services/api';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { useCart } from '../../context/CartContext';

export const SearchScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

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
    ];

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCategories(CATEGORIES);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            // Filter Categories
            const filteredC = CATEGORIES.filter(cat =>
                cat.name.toLowerCase().includes(lowerQuery)
            );
            setFilteredCategories(filteredC);
        }
    }, [searchQuery]);

    const handleCategoryPress = (categoryName: string) => {
        navigation.navigate('CategoryScreen', { categoryName });
    };

    const renderCategoryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.border }]}
            onPress={() => handleCategoryPress(item.name)}
        >
            <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
            <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: isDark ? colors.surface : colors.white }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.background : colors.surfaceHighlight }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search for services..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {searchQuery ? 'No categories found matching your search.' : 'Start typing to search for categories.'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
        ...shadows.small,
    },
    backButton: {
        marginRight: spacing.m,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        height: 40,
        borderRadius: borderRadius.m,
    },
    searchIcon: {
        marginRight: spacing.s,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        height: '100%',
    },
    listContent: {
        padding: spacing.m,
    },
    serviceItemWrapper: {
        marginBottom: spacing.m,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxl,
    },
    emptyText: {
        ...typography.body,
        marginTop: spacing.m,
        textAlign: 'center',
    },
    categoriesSection: {
        marginBottom: spacing.m,
    },
    sectionTitle: {
        ...typography.h2,
        marginBottom: spacing.s,
        paddingHorizontal: spacing.s,
    },
    categoriesList: {
        paddingHorizontal: spacing.s,
    },
    categoryCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.m,
        marginRight: spacing.s,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        width: 100,
        height: 100,
        ...shadows.small,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        marginBottom: spacing.s,
    },
    categoryName: {
        ...typography.caption,
        textAlign: 'center',
        fontWeight: '600',
    },
});
