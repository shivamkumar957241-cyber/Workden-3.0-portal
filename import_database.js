import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const folderPath = path.join(__dirname, 'New folder');

const parseValue = (val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null') return null;
  if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
    try { return JSON.parse(val); } catch(e) {}
  }
  return val;
};

const processFile = async (filePath, collectionName) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const cleaned = {};
        for (const [key, val] of Object.entries(data)) {
          if (val !== undefined) {
            cleaned[key] = parseValue(val);
          }
        }
        results.push(cleaned);
      })
      .on('end', async () => {
        console.log(`\n--- Processing ${results.length} records for ${collectionName} ---`);
        let success = 0;
        let errors = 0;
        for (const row of results) {
          try {
            // If it's a user, we must create them in Firebase Auth
            if (collectionName === 'AppUser' && row.email && row.login_password) {
              try {
                let pwd = String(row.login_password);
                if (pwd.length < 6) {
                    console.log(`[AUTH] Weak password for ${row.email}: ${pwd}. Padding to 6 chars.`);
                    pwd = pwd.padEnd(6, '0');
                }
                const cred = await createUserWithEmailAndPassword(auth, row.email, pwd);
                if (row.full_name) {
                  await updateProfile(cred.user, { displayName: row.full_name });
                }
                row.auth_uid = cred.user.uid;
                await signOut(auth);
              } catch (authErr) {
                if (authErr.code === 'auth/email-already-in-use') {
                  console.log(`[AUTH] User ${row.email} already exists in Firebase Auth.`);
                } else {
                  console.error(`[AUTH] Error for ${row.email}:`, authErr.message);
                }
              }
            }
            
            const docId = row.id || row._id;
            if (docId) {
              await setDoc(doc(db, collectionName, docId), row);
            } else {
              await addDoc(collection(db, collectionName), row);
            }
            success++;
          } catch (e) {
            errors++;
            console.error(`Error adding to ${collectionName}:`, e.message);
          }
        }
        console.log(`Finished ${collectionName}: ${success} successful, ${errors} errors.`);
        resolve();
      })
      .on('error', reject);
  });
};

const main = async () => {
  if (!fs.existsSync(folderPath)) {
    console.error("Folder 'New folder' not found!");
    process.exit(1);
  }
  const files = fs.readdirSync(folderPath);
  
  // Prioritize AppUser to ensure users are created first
  files.sort((a, b) => {
    if (a.includes('AppUser')) return -1;
    if (b.includes('AppUser')) return 1;
    return 0;
  });

  for (const file of files) {
    if (file.endsWith('_export.csv')) {
      const collectionName = file.replace('_export.csv', '');
      await processFile(path.join(folderPath, file), collectionName);
    }
  }
  console.log('\nMigration completed successfully!');
  process.exit(0);
};

main();
