import React, { createContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBE3Cm4NC34wBJDyFnEMOigw-0NDeAHbMo",
  authDomain: "localgp-42a4f.firebaseapp.com",
  projectId: "localgp-42a4f",
  storageBucket: "localgp-42a4f.appspot.com",
  messagingSenderId: "773513582062",
  appId: "1:773513582062:web:31433f5cfd19810b096aff",
  measurementId: "G-VN9SYZBQ44"
};

// Firebase Context
const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    // Check if Firebase app is already initialized
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);  // Initialize if no app exists
    } else {
      app = getApp();  // Use existing app if already initialized
    }
    
    setFirebaseApp(app);
    setDb(getFirestore(app));  // Initialize Firestore with the app
  }, []);

  return (
    <FirebaseContext.Provider value={{ db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;
