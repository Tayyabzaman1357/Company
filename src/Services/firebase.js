import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyD4Vf7SYhwWyFhtbn0oabI2Hz8i6RbFO5A", authDomain: "company-aa57d.firebaseapp.com", databaseURL: "https://company-aa57d-default-rtdb.firebaseio.com", projectId: "company-aa57d", storageBucket: "company-aa57d.firebasestorage.app", messagingSenderId: "200232796076", appId: "1:200232796076:web:3276960e40849a24768409", measurementId: "G-EE4RH5G7C7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);