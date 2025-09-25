// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// O Storage não é mais necessário aqui, a menos que você o use para outra coisa.
// import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration is now read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
// Check if Firebase has already been initialized
if (!getApps().length) {
  // Verifique se as chaves do Firebase existem antes de inicializar
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApps()[0];
}

// Inicialize os serviços do Firebase apenas se o app foi inicializado
const auth = app ? getAuth(app) : undefined;
// const storage = app ? getStorage(app) : undefined;

// Exporte `auth` para que possa ser usado, mas pode ser undefined se as chaves não estiverem no .env
export { app, auth };
