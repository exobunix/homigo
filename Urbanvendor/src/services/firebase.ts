import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBy2HN5WuKotc6VkNuT1gepHGStYgbL0V8',
  authDomain: 'urbanprox-7aa0d.firebaseapp.com',
  projectId: 'urbanprox-7aa0d',
  storageBucket: 'urbanprox-7aa0d.firebasestorage.app',
  messagingSenderId: '1032278721160',
  appId: '1:1032278721160:web:f3554ef71641e7daca153d',
  measurementId: 'G-7RZDK4LCQ8',
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0] as FirebaseApp;
}

const auth = getAuth(app);

export { app as firebaseApp, auth as firebaseAuth, firebaseConfig };
