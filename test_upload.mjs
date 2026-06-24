import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

async function test() {
  try {
    console.log("Uploading...");
    const storageRef = ref(storage, `banners/test.txt`);
    await uploadString(storageRef, "hello world");
    const url = await getDownloadURL(storageRef);
    console.log("Success:", url);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
