import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key] = value.replace(/"/g, '');
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Testing getBatches...");
    const q = collection(db, "batches");
    const snapshot = await getDocs(q);
    console.log("Success! Batches:", snapshot.docs.length);
    
    console.log("Testing addBatch...");
    const docRef = await addDoc(collection(db, "batches"), { name: "test_batch_123", created_at: new Date().toISOString() });
    console.log("Success! Added batch with id:", docRef.id);
  } catch (err) {
    console.error("Firebase Error:", err.message);
  }
}

test();
