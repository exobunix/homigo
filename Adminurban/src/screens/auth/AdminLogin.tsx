import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const AdminLogin = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !name || !phone) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            setLoading(true);
            const response = await api.registerAdmin({ name, email, password, phone });
            if (response.success) {
                Alert.alert('Success', 'Request sent to Master Admin. Please wait for approval.');
                setIsRegistering(false);
                // Clear sensitive fields
                setPassword('');
            } else {
                Alert.alert('Registration Failed', response.message || 'Failed to register');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.content, isMobile && styles.contentMobile]}>
                    {/* Left Side - Branding */}
                    <View style={[styles.leftSide, isMobile && styles.leftSideMobile]}>
                        <View style={styles.brandingContent}>
                            <Ionicons name="shield-checkmark" size={isMobile ? 48 : 64} color="#3b82f6" />
                            <Text style={[styles.brandTitle, isMobile && styles.brandTitleMobile]}>Urban Admin</Text>
                            <Text style={styles.brandSubtitle}>
                                Manage your urban services platform with ease
                            </Text>
                            {!isMobile && (
                                <View style={styles.features}>
                                    <View style={styles.feature}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <Text style={styles.featureText}>User Management</Text>
                                    </View>
                                    <View style={styles.feature}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <Text style={styles.featureText}>Vendor Approvals</Text>
                                    </View>
                                    <View style={styles.feature}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <Text style={styles.featureText}>Booking Analytics</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Right Side - Form */}
                    <View style={[styles.rightSide, isMobile && styles.rightSideMobile]}>
                        <View style={styles.formContainer}>
                            <View style={styles.formHeader}>
                                <Text style={styles.title}>{isRegistering ? 'Request Access' : 'Welcome Back'}</Text>
                                <Text style={styles.subtitle}>{isRegistering ? 'Fill all fields to become an admin' : 'Sign in to your admin account'}</Text>
                            </View>

                            <View style={styles.form}>
                                {isRegistering && (
                                    <>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Full Name</Text>
                                            <View style={styles.inputWrapper}>
                                                <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChangeText={setName}
                                                    placeholderTextColor="#94a3b8"
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Phone Number</Text>
                                            <View style={styles.inputWrapper}>
                                                <Ionicons name="call-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="+91 9876543210"
                                                    value={phone}
                                                    onChangeText={setPhone}
                                                    keyboardType="phone-pad"
                                                    placeholderTextColor="#94a3b8"
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="admin@urban.com"
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            placeholderTextColor="#94a3b8"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                            <Ionicons
                                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color="#94a3b8"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={isRegistering ? handleRegister : handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>{isRegistering ? 'Submit Request' : 'Sign In'}</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.switchContainer} onPress={() => setIsRegistering(!isRegistering)}>
                                    <Text style={styles.switchText}>
                                        {isRegistering ? 'Already have an account? ' : 'Want to become an admin? '}
                                        <Text style={styles.switchAction}>{isRegistering ? 'Sign In' : 'Request Access'}</Text>
                                    </Text>
                                </TouchableOpacity>

                                {!isRegistering && (
                                    <View style={styles.hint}>
                                        <Ionicons name="information-circle-outline" size={16} color="#64748b" />
                                        <Text style={styles.hintText}>
                                            Default: masteradmin@urban.com / masteradmin12345
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 600,
    },
    contentMobile: {
        flexDirection: 'column',
        minHeight: 'auto',
    },
    leftSide: {
        flex: 1,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 48,
    },
    leftSideMobile: {
        padding: 32,
        flex: 0,
    },
    brandingContent: {
        maxWidth: 400,
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 24,
        marginBottom: 12,
    },
    brandTitleMobile: {
        fontSize: 28,
        marginTop: 16,
    },
    brandSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 32,
    },
    features: {
        width: '100%',
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#e2e8f0',
    },
    rightSide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 48,
    },
    rightSideMobile: {
        padding: 24,
    },
    formContainer: {
        width: '100%',
        maxWidth: 420,
    },
    formHeader: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    form: {
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    inputIcon: {
        marginLeft: 16,
    },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    eyeIcon: {
        padding: 14,
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 6,
    },
    hintText: {
        fontSize: 13,
        color: '#64748b',
    },
    switchContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
        color: '#64748b',
    },
    switchAction: {
        color: '#3b82f6',
        fontWeight: 'bold',
    },
});
