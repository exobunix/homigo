import React from 'react';
import { Platform, ScrollView, View, StyleSheet, SafeAreaView } from 'react-native';
import { WebLayout } from './WebLayout';

interface ScreenWrapperProps {
    children: React.ReactNode;
    title: string;
    onLogout: () => void;
    adminName: string;
    currentPage?: string;
    onNavigate?: (page: string) => void;
    noPadding?: boolean;
}

export const ScreenWrapper = ({
    children,
    title,
    onLogout,
    adminName,
    currentPage = 'dashboard',
    onNavigate,
    noPadding = false
}: ScreenWrapperProps) => {
    // On web, use WebLayout
    if (Platform.OS === 'web') {
        return (
            <WebLayout
                title={title}
                onLogout={onLogout}
                adminName={adminName}
                currentPage={currentPage}
                onNavigate={onNavigate}
            >
                {children}
            </WebLayout>
        );
    }

    // On mobile, just render children in a SafeAreaView with ScrollView
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, noPadding && styles.noPadding]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    noPadding: {
        paddingHorizontal: 0,
        paddingTop: 0,
    },
});
