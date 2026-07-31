import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Image, Switch } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export const WebContentManager = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState<any>({
        hero: { title: '', subtitle: '', image: '', trendingTags: [] },
        spotlight: [],
        whyChooseUs: [],
        flashSale: { isActive: true, title: '', subtitle: '', endTime: '' },
        paintingBanner: { image: '' }
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const response = await api.getWebContent('home');
        if (response.success && response.data) {
            setContent(response.data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);
        // Exclude _id to avoid immutable field error
        const { _id, __v, createdAt, updatedAt, ...updateData } = content;
        const response = await api.updateWebContent({ ...updateData, page: 'home' });
        setLoading(false);
        if (response.success) {
            Alert.alert("Success", "Home page content updated successfully!");
        } else {
            Alert.alert("Error", "Failed to update content");
        }
    };

    const updateHero = (key: string, value: any) => {
        setContent((prev: any) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    const InputField = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                multiline={multiline}
            />
        </View>
    );

    return (
        <ScreenWrapper
            title="Web Home Page Manager"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="web-content"
            onNavigate={onNavigate}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Manage content for the user website home page</Text>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save Changes"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.card}>
                    <SectionHeader title="Hero Section" />
                    <InputField
                        label="Main Title"
                        value={content.hero?.title}
                        onChangeText={(t: string) => updateHero('title', t)}
                        placeholder="e.g. Home services at your doorstep"
                    />
                    <InputField
                        label="Subtitle"
                        value={content.hero?.subtitle}
                        onChangeText={(t: string) => updateHero('subtitle', t)}
                        placeholder="e.g. Hygenic, Safe & Insured"
                    />
                    <InputField
                        label="Hero Image URL"
                        value={content.hero?.image}
                        onChangeText={(t: string) => updateHero('image', t)}
                        placeholder="https://..."
                    />
                    {content.hero?.image ? (
                        <Image source={{ uri: content.hero.image }} style={styles.previewImage} />
                    ) : null}
                    <InputField
                        label="Trending Tags (comma separated)"
                        value={Array.isArray(content.hero?.trendingTags) ? content.hero.trendingTags.join(', ') : ''}
                        onChangeText={(t: string) => updateHero('trendingTags', t.split(',').map(s => s.trim()))}
                        placeholder="AC Repair, Cleaning"
                    />
                </View>

                {/* Flash Sale */}
                <View style={styles.card}>
                    <SectionHeader title="Flash Sale Banner" />
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>Active</Text>
                        <Switch
                            value={content.flashSale?.isActive}
                            onValueChange={(v) => setContent((prev: any) => ({ ...prev, flashSale: { ...prev.flashSale, isActive: v } }))}
                        />
                    </View>
                    <InputField
                        label="Sale Title"
                        value={content.flashSale?.title}
                        onChangeText={(t: string) => setContent((prev: any) => ({ ...prev, flashSale: { ...prev.flashSale, title: t } }))}
                    />
                    <InputField
                        label="Sale Subtitle"
                        value={content.flashSale?.subtitle}
                        onChangeText={(t: string) => setContent((prev: any) => ({ ...prev, flashSale: { ...prev.flashSale, subtitle: t } }))}
                    />
                    <InputField
                        label="End Date (ISO String)"
                        value={content.flashSale?.endTime}
                        onChangeText={(t: string) => setContent((prev: any) => ({ ...prev, flashSale: { ...prev.flashSale, endTime: t } }))}
                        placeholder="2025-12-31T23:59:59Z"
                    />
                </View>

                {/* Painting Banner */}
                <View style={styles.card}>
                    <SectionHeader title="Middle Banner (Painting)" />
                    <InputField
                        label="Image URL"
                        value={content.paintingBanner?.image}
                        onChangeText={(t: string) => setContent((prev: any) => ({ ...prev, paintingBanner: { ...prev.paintingBanner, image: t } }))}
                    />
                    {content.paintingBanner?.image ? (
                        <Image source={{ uri: content.paintingBanner.image }} style={styles.bannerPreview} />
                    ) : null}
                </View>

                {/* Advanced: JSON Edit for Lists */}
                <View style={styles.card}>
                    <SectionHeader title="Advanced: Spotlight Items (JSON)" />
                    <InputField
                        label="Edit JSON Array directly"
                        value={JSON.stringify(content.spotlight || [], null, 2)}
                        onChangeText={(t: string) => {
                            try {
                                const parsed = JSON.parse(t);
                                setContent((prev: any) => ({ ...prev, spotlight: parsed }));
                            } catch (e) {
                                // Ignore parse error while typing
                            }
                        }}
                        multiline
                    />
                </View>

                <View style={styles.card}>
                    <SectionHeader title="Advanced: Why Choose Us (JSON)" />
                    <InputField
                        label="Edit JSON Array directly"
                        value={JSON.stringify(content.whyChooseUs || [], null, 2)}
                        onChangeText={(t: string) => {
                            try {
                                const parsed = JSON.parse(t);
                                setContent((prev: any) => ({ ...prev, whyChooseUs: parsed }));
                            } catch (e) {
                                // Ignore
                            }
                        }}
                        multiline
                    />
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    saveBtn: {
        flexDirection: 'row',
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        gap: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 8,
        resizeMode: 'cover',
    },
    bannerPreview: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginTop: 8,
        resizeMode: 'cover',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    }
});
