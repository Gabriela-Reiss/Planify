// /src/configurations/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbBP1wf1_oXPJqthrwSY7r4d-lpSl9Z2M",
  authDomain: "fir-auth-e43e3.firebaseapp.com",
  projectId: "fir-auth-e43e3",
  storageBucket: "fir-auth-e43e3.firebasestorage.app",
  messagingSenderId: "84569492548",
  appId: "1:84569492548:web:6974a2d9012dab67690011"
};

const {getReactNativePersistence} = require("firebase/auth") as any;

const app = initializeApp(firebaseConfig);


const database = getFirestore(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { auth, database, getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc };
