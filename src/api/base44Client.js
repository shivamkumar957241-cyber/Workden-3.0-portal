import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAhyYS5qyvHTJB2qzjI3kFDLB-Z9nuHEZk",
  authDomain: "workden-30-portal.firebaseapp.com",
  projectId: "workden-30-portal",
  storageBucket: "workden-30-portal.firebasestorage.app",
  messagingSenderId: "675148859567",
  appId: "1:675148859567:web:9422299b6aa1d6da686c5a",
  measurementId: "G-FK7K5DLX2R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Keep track of current user
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = { id: user.uid, email: user.email, full_name: user.displayName, role: 'user' };
  } else {
    currentUser = null;
  }
});

// Seed and deduplicate default tasks
let isSeedingTasks = false;
const seedTasksIfEmpty = async () => {
  if (isSeedingTasks) return;
  isSeedingTasks = true;
  const taskRef = collection(db, "Task");
  const snap = await getDocs(taskRef);
  if (snap.empty) {
    const defaultTasks = [
      { name: "Data Entry", description: "Simple typing work", page_route: "DataEntry" },
      { name: "Form Filling", description: "Fill online forms accurately", page_route: "FormFilling" },
      { name: "Grammar Correction", description: "Correct grammar in paragraphs", page_route: "GrammarCorrection" },
      { name: "PDF to Word Typing", description: "Convert PDF documents to Word", page_route: "PdfToWordTyping" }
    ];
    for (const t of defaultTasks) {
      await addDoc(taskRef, t);
    }
  } else {
    // Remove duplicates from backend
    const seen = new Set();
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (seen.has(data.name)) {
        try { await deleteDoc(doc(db, "Task", docSnap.id)); } catch(e) {}
      } else {
        seen.add(data.name);
      }
    }
  }
  isSeedingTasks = false;
};

const getEntityAPI = (entityName) => {
  const colRef = collection(db, entityName);

  return {
    list: async () => {
      if (entityName === "Task") await seedTasksIfEmpty();
      const snap = await getDocs(colRef);
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Deduplicate locally to ensure 1 task is shown while backend cleans up
      if (entityName === "Task") {
         const unique = [];
         const seen = new Set();
         for (const r of results) {
           if (!seen.has(r.name)) { seen.add(r.name); unique.push(r); }
         }
         results = unique;
      }

      // Sort globally by created_date descending (newest first)
      results.sort((a, b) => {
        const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
        const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
        return dateB - dateA;
      });

      return results;
    },
    filter: async (criteria) => {
      let q = colRef;
      if (criteria && typeof criteria === 'object') {
        for (const [key, val] of Object.entries(criteria)) {
          if (val !== undefined && val !== null) {
            q = query(q, where(key, "==", val));
          }
        }
      }
      const snap = await getDocs(q);
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fallback for legacy user sessions that are still in localStorage
      if (entityName === "AppUser" && results.length === 0 && criteria?.login_user_id) {
         const saved = localStorage.getItem('workden_user');
         if (saved) {
           const parsed = JSON.parse(saved);
           if (parsed.login_user_id === criteria.login_user_id) {
              if (!parsed.id) parsed.id = parsed.login_user_id || "temp-id";
              results = [parsed];
           }
         }
      }
      
      return results;
    },
    create: async (data) => {
      const cleanData = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(v => v === undefined ? null : cleanData(v));
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, cleanData(v)]));
      };
      const cleaned = cleanData(data);
      const docRef = await addDoc(colRef, cleaned);
      return { id: docRef.id, ...cleaned };
    },
    update: async (id, data) => {
      if (!id) throw new Error("Entity update requires an ID");
      const cleanData = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(v => v === undefined ? null : cleanData(v));
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, cleanData(v)]));
      };
      const cleaned = cleanData(data);
      const docRef = doc(db, entityName, id);
      await updateDoc(docRef, cleaned);
      return { id, ...cleaned };
    },
    delete: async (id) => {
      if (!id) throw new Error("Entity delete requires an ID");
      const docRef = doc(db, entityName, id);
      await deleteDoc(docRef);
    }
  };
};

export const base44 = {
  entities: new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === "string") {
        return getEntityAPI(prop);
      }
      return target[prop];
    }
  }),
  auth: {
    me: async () => {
      if (auth.currentUser) {
        if (auth.currentUser.email) {
          // Lookup by email to support migrated users whose auth uid differs from their database id
          const userSnap = await getDocs(query(collection(db, "AppUser"), where("email", "==", auth.currentUser.email)));
          
          if (!userSnap.empty) {
            const doc = userSnap.docs[0];
            return { id: doc.id, ...doc.data() };
          }
        } else if (auth.currentUser.phoneNumber) {
          const userSnap = await getDocs(query(collection(db, "AppUser"), where("phone", "==", auth.currentUser.phoneNumber.replace('+91', ''))));
          if (!userSnap.empty) {
            const doc = userSnap.docs[0];
            return { id: doc.id, ...doc.data() };
          }
        }
        return { id: auth.currentUser.uid, email: auth.currentUser.email, full_name: auth.currentUser.displayName, role: 'user' };
      }
      
      // Fallback for users logged in before the Firebase migration
      const saved = localStorage.getItem('workden_user');
      if (saved) {
         const parsed = JSON.parse(saved);
         if (!parsed.id) parsed.id = parsed.login_user_id || "temp-id";
         return parsed;
      }
      
      throw new Error("Not logged in");
    },
    login: async (email, password) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    },
    register: async (data) => {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (data.full_name) {
        await updateProfile(cred.user, { displayName: data.full_name });
      }
      await addDoc(collection(db, "AppUser"), {
        id: cred.user.uid,
        email: data.email,
        full_name: data.full_name,
        role: "user",
        created_at: new Date().toISOString()
      });
      return cred.user;
    },
    logout: async () => {
      await signOut(auth);
    },
    updateMe: async (data) => {
      if (!auth.currentUser) return;
      if (data.full_name) {
        await updateProfile(auth.currentUser, { displayName: data.full_name });
      }
      const userSnap = await getDocs(query(collection(db, "AppUser"), where("id", "==", auth.currentUser.uid)));
      if (!userSnap.empty) {
        await updateDoc(doc(db, "AppUser", userSnap.docs[0].id), data);
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { file_url: url };
      }
    }
  },
  users: {
    inviteUser: async () => {}
  },
  appLogs: {
    logUserInApp: async () => {}
  }
};
