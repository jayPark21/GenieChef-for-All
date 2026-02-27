import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    console.log("Fetching DB...");
    const snap = await getDoc(doc(db, "users", "guest_user"));
    if (snap.exists()) {
        const data = snap.data();
        console.log("Owned Ingredients Count:", data.ownedIngredients?.length || 0);
        console.log("Custom Ingredients Count:", data.customIngredients?.length || 0);
        console.log("Custom Ingredients:", JSON.stringify(data.customIngredients, null, 2));
    } else {
        console.log("No data found for guest_user");
    }
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
