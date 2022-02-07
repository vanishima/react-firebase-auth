import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
});

const createWhereClause = (property, comparison, value) => {
  return where(property, comparison, value);
};

const createQuery = (collectionRef, queryList) => {
  return query(collectionRef, queryList[0], queryList[1]);
};

const getChildFolderQuery = (collectionRef, folderId, currentUser) => {
  const q1 = db.createWhereClause("parentId", "==", folderId);
  const q2 = db.createWhereClause("userId", "==", currentUser.uid);
  return query(collectionRef, q1, q2, orderBy("createdAt"));
};

export const auth = getAuth(app);
const database = getFirestore();
export const db = {
  folders: collection(database, "folders"),
  getCurrentTimestamp: serverTimestamp,
  formatDocSnap: doc => {
    return { id: doc.id, ...doc.data() };
  },
  createWhereClause,
  createQuery,
  getChildFolderQuery,
};

// export default app;
