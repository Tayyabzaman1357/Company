import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

const provider = new FacebookAuthProvider();

export const loginWithFacebook = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user;
};