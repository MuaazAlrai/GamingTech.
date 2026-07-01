import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDun1f6aYs8xLDTeuYxozp-an7BBKrAP4I",
  authDomain: "gamingtech-966e5.firebaseapp.com",
  projectId: "gamingtech-966e5",
  storageBucket: "gamingtech-966e5.firebasestorage.app",
  messagingSenderId: "344704365813",
  appId: "1:344704365813:web:31fb11dbd30fec0639c1bc",
  measurementId: "G-V8D4LNTM6P",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(firebaseApp) : null,
);
