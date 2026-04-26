import { db } from "./firebase";
import { doc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";

// Save user
export const saveUser = async (user) => {
  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    email: user.email,
    photo: user.photoURL
  });
};

// Add company
export const addCompany = async (company) => {
  await addDoc(collection(db, "companies"), company);
};

// Get companies
export const getCompanies = async () => {
  const snapshot = await getDocs(collection(db, "companies"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};