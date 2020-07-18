import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL:
    process.env.NODE_ENV === "development"
      ? `http://localhost:9000?ns=${process.env.NEXT_PUBLIC_PROJECT_ID}`
      : process.env.NEXT_PUBLIC_DB_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

// Initialize Firebase

export const fb = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

export const auth = fb.auth();
export const db = fb.database();
const functions = fb.functions();
if (process.env.NODE_ENV === "development") {
  functions.useFunctionsEmulator("http://localhost:5001");
}
export { functions };
export const ref = path => (path ? db.ref(path) : db.ref());
