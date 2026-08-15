import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// A configuração web do Firebase identifica o projeto, mas não é uma chave secreta.
// O acesso aos dados continua protegido pelo login e pelas regras do Firestore.
const firebaseConfig = {
  apiKey: "AIzaSyA3-Ci1tbDAVn1_rsLQiqXml2RRtsmm1Ys",
  authDomain: "painel-estudos-491a7.firebaseapp.com",
  projectId: "painel-estudos-491a7",
  storageBucket: "painel-estudos-491a7.firebasestorage.app",
  messagingSenderId: "219302191889",
  appId: "1:219302191889:web:2c47c451f18a1fd47662b0",
  measurementId: "G-29XSCRB8L3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
