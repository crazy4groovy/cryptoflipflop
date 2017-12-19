import firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyBtJqrLB37zK1oFeqyG1wMUzkU6k7onBaQ',
  authDomain: 'cryptoflipflop.firebaseapp.com',
  databaseURL: 'https://cryptoflipflop.firebaseio.com',
  projectId: 'cryptoflipflop',
  storageBucket: 'cryptoflipflop.appspot.com',
  messagingSenderId: '502735770336'
}

firebase.initializeApp(config)

export default firebase

export const db = firebase.database()

export const { auth } = firebase // https://firebase.google.com/docs/auth/web/manage-users

// auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(...)
export const createUser = (...args) => auth().createUserWithEmailAndPassword(...args)
export const signIn = () => auth().signInWithEmailAndPassword
export const signOut = () => auth().signOut
export const userChanged = (...args) => auth().onAuthStateChanged(...args)
export const uid = () => (auth().currentUser || {}).uid
// export const token = () => auth().getToken()

export const timestamp = firebase.database.ServerValue.TIMESTAMP
