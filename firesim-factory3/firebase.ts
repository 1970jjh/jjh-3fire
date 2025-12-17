// Firebase 설정 파일
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyDUQ2K91akKkqCaSyqOX5cGIquwvovj7QY",
  authDomain: "jjh-3fire.firebaseapp.com",
  projectId: "jjh-3fire",
  storageBucket: "jjh-3fire.firebasestorage.app",
  messagingSenderId: "640057961858",
  appId: "1:640057961858:web:a11ff5e5c4f98c3455b39b"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 내보내기
export const db = getFirestore(app);

export default app;
