import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyD-vmlhs-euVh_zol7KbcJKHkKNMsxfp0Y",
    authDomain: "barber-shop-e547b.firebaseapp.com",
    projectId: "barber-shop-e547b",
    storageBucket: "barber-shop-e547b.firebasestorage.app",
    messagingSenderId: "694302073958",
    appId: "1:694302073958:web:5e351450eef96971c1f9a7",
    measurementId: "G-D1DZS5DB9B"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider()

