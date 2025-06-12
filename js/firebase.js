// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTaa9yQLrvOXanDQNjFE_qAwP4TjpBmj4",
  authDomain: "trackup-11ec2.firebaseapp.com",
  projectId: "trackup-11ec2",
  storageBucket: "trackup-11ec2.firebasestorage.app",
  messagingSenderId: "175798822097",
  appId: "1:175798822097:web:842eb385af8cd5d94691f0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const realtimeDb = firebase.database();

// Export Firebase services
export { db, auth, realtimeDb };
