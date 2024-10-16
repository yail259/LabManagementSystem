import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDFgFW_Lm7P0D1NiWrdk5fzYNgYJVyiC14",
  authDomain: "photonicslabbookings.firebaseapp.com",
  projectId: "photonicslabbookings",
  storageBucket: "photonicslabbookings.appspot.com",
  messagingSenderId: "987603461267",
  appId: "1:987603461267:web:669909488966071f6b5966",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
