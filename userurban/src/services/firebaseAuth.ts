import { Platform } from 'react-native';

// Types
type ConfirmationResult = any;
type UserCredential = any;
type RecaptchaVerifierType = any;

// Firebase will be initialized only on web
let auth: any = null;
let RecaptchaVerifier: any = null;
let signInWithPhoneNumber: any = null;
let initPromise: Promise<void> | null = null;

// Initialize Firebase for web only
if (Platform.OS === 'web') {
    initPromise = (async () => {
        try {
            const { initializeApp } = await import('firebase/app');
            const authModule = await import('firebase/auth');

            const firebaseConfig = {
                apiKey: "AIzaSyBy2HN5WuKotc6VkNuT1gepHGStYgbL0V8",
                authDomain: "urbanprox-7aa0d.firebaseapp.com",
                projectId: "urbanprox-7aa0d",
                storageBucket: "urbanprox-7aa0d.firebasestorage.app",
                messagingSenderId: "1032278721160",
                appId: "1:1032278721160:web:f3554ef71641e7daca153d",
                measurementId: "G-7RZDK4LCQ8",
            };

            const app = initializeApp(firebaseConfig);
            auth = authModule.getAuth(app);
            RecaptchaVerifier = authModule.RecaptchaVerifier;
            signInWithPhoneNumber = authModule.signInWithPhoneNumber;

            console.log('🔥 Firebase initialized');
        } catch (error) {
            console.error('Firebase init error:', error);
            throw error;
        }
    })();
}

class FirebaseAuthService {
    private recaptcha: RecaptchaVerifierType | null = null;
    private confirmation: ConfirmationResult | null = null;

    initRecaptcha() {
        if (Platform.OS !== 'web' || typeof window === 'undefined') return null;

        // Create container if missing
        let container = document.getElementById('recaptcha-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'recaptcha-container';
            document.body.appendChild(container);
        }

        // Create new invisible recaptcha if not exists
        if (!this.recaptcha && RecaptchaVerifier && auth) {
            // CRITICAL: auth must be the FIRST parameter in Firebase v9+
            this.recaptcha = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                {
                    size: 'invisible',
                    callback: () => console.log('reCAPTCHA solved'),
                }
            );
            console.log('✅ RecaptchaVerifier created');
        }

        return this.recaptcha;
    }

    async sendOTP(phoneNumber: string) {
        if (Platform.OS === 'web') {
            try {
                // Wait for Firebase to initialize
                if (initPromise) {
                    console.log('⏳ Waiting for Firebase init...');
                    await initPromise;
                }

                if (!auth || !RecaptchaVerifier || !signInWithPhoneNumber) {
                    throw new Error('Firebase not fully initialized');
                }

                const verifier = this.initRecaptcha();
                if (!verifier) throw new Error('reCAPTCHA failed to initialize');

                this.confirmation = await signInWithPhoneNumber(
                    auth,
                    phoneNumber,
                    verifier
                );

                console.log('✅ OTP sent successfully');
                return { success: true, message: 'OTP sent successfully' };
            } catch (error: any) {
                console.error('❌ Send OTP Error:', error);

                // Clear recaptcha on error
                if (this.recaptcha) {
                    try { this.recaptcha.clear(); } catch { }
                    this.recaptcha = null;
                }

                return { success: false, message: error.message };
            }
        } else {
            // Mobile mock
            console.log('Mock OTP sent (mobile)');
            return { success: true, message: 'OTP sent (mock)' };
        }
    }

    async verifyOTP(code: string, phoneNumber: string) {
        if (Platform.OS === 'web') {
            try {
                if (!this.confirmation) {
                    return { success: false, message: 'No OTP request found' };
                }

                const userCredential: UserCredential = await this.confirmation.confirm(code);
                const idToken = await userCredential.user.getIdToken();

                console.log('✅ OTP verified successfully');
                return {
                    success: true,
                    idToken,
                    phoneNumber: userCredential.user.phoneNumber,
                };
            } catch (error: any) {
                console.error('Verify OTP Error:', error);
                return { success: false, message: error.message || 'Invalid OTP' };
            }
        } else {
            // Mobile mock
            if (code === '123456') {
                return { success: true, idToken: null, phoneNumber };
            }
            return { success: false, message: 'Invalid OTP' };
        }
    }

    getCurrentUser() {
        return auth?.currentUser || null;
    }

    async signOut() {
        if (auth && Platform.OS === 'web') {
            const { signOut: firebaseSignOut } = await import('firebase/auth');
            await firebaseSignOut(auth);
        }
        this.confirmation = null;
        if (this.recaptcha) {
            try { this.recaptcha.clear(); } catch { }
            this.recaptcha = null;
        }
    }
}

export const firebaseAuthService = new FirebaseAuthService();
