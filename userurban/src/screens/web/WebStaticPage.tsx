import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: colors.background,
        minHeight: 600,
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 800,
        paddingHorizontal: spacing.l,
    },
    mainTitle: {
        ...typography.h1,
        marginBottom: spacing.l,
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        width: '100%',
        marginBottom: spacing.xl,
    },
    heading: {
        ...typography.h3,
        marginTop: spacing.xl,
        marginBottom: spacing.m,
        color: colors.text,
    },
    paragraph: {
        ...typography.body,
        fontSize: 18,
        lineHeight: 28,
        color: colors.textSecondary,
        marginBottom: spacing.m,
    },
    bulletList: {
        marginBottom: spacing.m,
        paddingLeft: spacing.m,
    },
    bulletItem: {
        ...typography.body,
        fontSize: 18,
        lineHeight: 28,
        color: colors.textSecondary,
        marginBottom: spacing.s,
    },
    card: {
        backgroundColor: colors.white,
        padding: spacing.l,
        borderRadius: borderRadius.l,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reviewText: {
        ...typography.body,
        fontStyle: 'italic',
        lineHeight: 24,
        marginBottom: spacing.s,
    },
    reviewer: {
        ...typography.bodyBold,
        textAlign: 'right',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    blogPost: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.l,
    },
    blogTitle: {
        ...typography.h3,
        fontSize: 20,
        marginBottom: spacing.s,
    },
    blogSnippet: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.s,
    },
    readMore: {
        color: colors.primary,
        fontWeight: '600',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
        backgroundColor: colors.white,
        padding: spacing.l,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        borderColor: colors.border,
    },
    contactLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    contactValue: {
        ...typography.h3,
        fontSize: 18,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.m,
        alignSelf: 'flex-start',
        marginTop: spacing.m,
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
    }
});

type PageType =
    | 'about-us'
    | 'terms'
    | 'privacy'
    | 'anti-discrimination'
    | 'impact'
    | 'reviews'
    | 'categories-near-you'
    | 'blog'
    | 'contact-us'
    | 'register-professional';

interface WebStaticPageProps {
    onNavigate: (route: string, params?: any) => void;
    page: PageType;
}

const ImagePlaceholder = () => (
    <View style={{ width: '100%', height: 150, backgroundColor: '#eee' }}>
        <Ionicons name="image-outline" size={40} color="#ccc" style={{ alignSelf: 'center', marginTop: 50 }} />
    </View>
);

const PAGE_CONTENT: Record<PageType, { title: string; content: React.ReactNode }> = {
    'about-us': {
        title: 'About Urban Prox',
        content: (
            <View>
                <Text style={styles.paragraph}>
                    Urban Prox is a leading home services platform connecting customers with trusted, verified professionals.
                    Founded in 2024, our mission is to empower millions of service professionals to deliver services at home
                    specifically across India.
                </Text>
                <Text style={styles.paragraph}>
                    What defines us is our commitment to quality. We don't just aggregate professionals; we verify, train,
                    and equip them to ensure you get a standardized, high-quality service experience every time.
                </Text>
                <Text style={styles.heading}>Our Vision</Text>
                <Text style={styles.paragraph}>
                    To be the most trusted home services platform, creating happy homes and empowered professionals.
                </Text>
            </View>
        )
    },
    'terms': {
        title: 'Terms & Conditions',
        content: (
            <View>
                <Text style={styles.paragraph}>Last Updated: December 2024</Text>
                <Text style={styles.heading}>1. Introduction</Text>
                <Text style={styles.paragraph}>
                    Welcome to Urban Prox. By using our website and app, you agree to these terms.
                </Text>
                <Text style={styles.heading}>2. Service Bookings</Text>
                <Text style={styles.paragraph}>
                    Bookings are subject to professional availability. Cancellation fees may apply if cancelled within 2 hours of the scheduled time.
                </Text>
                <Text style={styles.heading}>3. Payments</Text>
                <Text style={styles.paragraph}>
                    We accept credit cards, UPI, and cash. All specialized payments are processed securely.
                </Text>
            </View>
        )
    },
    'privacy': {
        title: 'Privacy Policy',
        content: (
            <View>
                <Text style={styles.paragraph}>
                    Your privacy is important to us. This policy outlines how we collect, use, and protect your data.
                </Text>
                <Text style={styles.heading}>Data Collection</Text>
                <Text style={styles.paragraph}>
                    We collect your name, phone number, and address to facilitate service delivery. Location data is used to match you with nearby professionals.
                </Text>
                <Text style={styles.heading}>Data Security</Text>
                <Text style={styles.paragraph}>
                    We use industry-standard encryption to protect your personal information. We do not sell your data to third parties.
                </Text>
            </View>
        )
    },
    'anti-discrimination': {
        title: 'Anti-Discrimination Policy',
        content: (
            <View>
                <Text style={styles.paragraph}>
                    Urban Prox has a zero-tolerance policy towards discrimination.
                </Text>
                <Text style={styles.paragraph}>
                    We prohibit discrimination against any professional or customer based on race, religion, caste, national origin, disability, sexual orientation, sex, marital status, gender identity, or age.
                </Text>
                <Text style={styles.paragraph}>
                    Any violation of this policy will result in immediate suspension from the platform.
                </Text>
            </View>
        )
    },
    'impact': {
        title: 'Social Impact',
        content: (
            <View>
                <Text style={styles.paragraph}>
                    We are building a platform that empowers individual service professionals to become micro-entrepreneurs.
                </Text>
                <Text style={styles.heading}>Key Metrics</Text>
                <View style={styles.bulletList}>
                    <Text style={styles.bulletItem}>• Over 500+ professionals trained</Text>
                    <Text style={styles.bulletItem}>• 30% increase in average earnings for partners</Text>
                    <Text style={styles.bulletItem}>• Insurance coverage for all partners</Text>
                </View>
            </View>
        )
    },
    'reviews': {
        title: 'Customer Reviews',
        content: (
            <View>
                <Text style={styles.paragraph}>See what our happy customers have to say.</Text>
                <View style={[styles.card, { marginTop: spacing.m }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s }}>
                        <Ionicons name="star" size={16} color="#FFB400" />
                        <Ionicons name="star" size={16} color="#FFB400" />
                        <Ionicons name="star" size={16} color="#FFB400" />
                        <Ionicons name="star" size={16} color="#FFB400" />
                        <Ionicons name="star" size={16} color="#FFB400" />
                    </View>
                    <Text style={styles.reviewText}>"Excellent service! The professional arrived on time and did a thorough job with the cleaning."</Text>
                    <Text style={styles.reviewer}>- Priya S., Bangalore</Text>
                </View>
                <View style={[styles.card, { marginTop: spacing.m }]}>
                    <Text style={styles.reviewText}>"Very professional AC repair service. Transparent pricing."</Text>
                    <Text style={styles.reviewer}>- Rahul K., Delhi</Text>
                </View>
            </View>
        )
    },
    'categories-near-you': {
        title: 'Categories Near You',
        content: (
            <View>
                <Text style={styles.paragraph}>We are currently operational in the following cities:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.m, marginTop: spacing.m }}>
                    {['Bangalore', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'].map(city => (
                        <View key={city} style={styles.chip}>
                            <Ionicons name="location-outline" size={16} color={colors.primary} />
                            <Text style={{ marginLeft: 4 }}>{city}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )
    },
    'blog': {
        title: 'Urban Prox Blog',
        content: (
            <View>
                <Text style={styles.paragraph}>Tips, tricks, and insights for your home.</Text>
                <TouchableOpacity style={styles.blogPost}>
                    <ImagePlaceholder />
                    <View style={{ padding: spacing.m }}>
                        <Text style={styles.blogTitle}>5 Tips for Summer AC Maintenance</Text>
                        <Text style={styles.blogSnippet}>Keep your AC running efficiently with these simple tips...</Text>
                        <Text style={styles.readMore}>Read More</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.blogPost}>
                    <ImagePlaceholder />
                    <View style={{ padding: spacing.m }}>
                        <Text style={styles.blogTitle}>Deep Cleaning Checklist for 2025</Text>
                        <Text style={styles.blogSnippet}>Everything you need to know about deep cleaning your home...</Text>
                        <Text style={styles.readMore}>Read More</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    },
    'contact-us': {
        title: 'Contact Us',
        content: (
            <View>
                <Text style={styles.paragraph}>We'd love to hear from you. Reach out to us for any queries or feedback.</Text>

                <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={24} color={colors.primary} />
                    <View style={{ marginLeft: spacing.m }}>
                        <Text style={styles.contactLabel}>Email</Text>
                        <Text style={styles.contactValue}>help@homigo.com</Text>
                    </View>
                </View>

                <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={24} color={colors.primary} />
                    <View style={{ marginLeft: spacing.m }}>
                        <Text style={styles.contactLabel}>Phone</Text>
                        <Text style={styles.contactValue}>+91 1800-123-4567</Text>
                    </View>
                </View>

                <View style={styles.contactItem}>
                    <Ionicons name="location-outline" size={24} color={colors.primary} />
                    <View style={{ marginLeft: spacing.m }}>
                        <Text style={styles.contactLabel}>Office</Text>
                        <Text style={styles.contactValue}>Urban Prox HQ, Indiranagar, Bangalore, 560038</Text>
                    </View>
                </View>
            </View>
        )
    },
    'register-professional': {
        title: 'Partner With Us',
        content: (
            <View>
                <Text style={styles.paragraph}>
                    Join thousands of professionals growing their business with Urban Prox.
                </Text>
                <Text style={styles.heading}>Benefits</Text>
                <View style={styles.bulletList}>
                    <Text style={styles.bulletItem}>• Steady stream of customers</Text>
                    <Text style={styles.bulletItem}>• Timely payments</Text>
                    <Text style={styles.bulletItem}>• Training and upskilling</Text>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openURL('https://urbanvendor.com')}>
                    <Text style={styles.primaryButtonText}>Download Partner App</Text>
                </TouchableOpacity>
            </View>
        )
    }
};

export const WebStaticPage: React.FC<WebStaticPageProps> = ({ onNavigate, page }) => {
    const pageData = PAGE_CONTENT[page];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

    if (!pageData) return null;

    return (
        <WebLayout onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.contentWrapper}>
                    <Text style={styles.mainTitle}>{pageData.title}</Text>
                    <View style={styles.divider} />
                    {pageData.content}
                </View>
            </View>
        </WebLayout>
    );
};
