import { initializeApp } from "firebase/app"
import { getAuth, GithubAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCLlnT4iogBAkwadQEfL3LS-rZD8G-LlpY",
  authDomain: "crave-finance.firebaseapp.com",
  projectId: "crave-finance",
  storageBucket: "crave-finance.firebasestorage.app",
  messagingSenderId: "666405090043",
  appId: "1:666405090043:web:81b8f20897c42e36bdf65e",
  measurementId: "G-EGJRP9KV1S",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const githubProvider = new GithubAuthProvider()
