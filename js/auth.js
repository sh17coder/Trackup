import { auth } from './firebase.js';

// DOM elements
const signUpForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// Sign up new users
if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signUpForm['signup-email'].value;
    const password = signUpForm['signup-password'].value;
    
    auth.createUserWithEmailAndPassword(email, password)
      .then(cred => {
        // Generate unique user code
        const userCode = generateUserCode();
        
        // Create user document in Firestore
        return db.collection('users').doc(cred.user.uid).set({
          email: email,
          userCode: userCode,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        window.location.href = '/';
      })
      .catch(err => {
        console.error("Sign up error:", err);
        alert(err.message);
      });
  });
}

// Login existing users
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;
    
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = '/';
      })
      .catch(err => {
        console.error("Login error:", err);
        alert(err.message);
      });
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        window.location.href = '/auth.html';
      });
  });
}

// Generate a unique user code (e.g., AB1234)
function generateUserCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = '';
  
  // First two letters
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Then four numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user);
    // Update UI for logged in user
  } else {
    console.log('User logged out');
    // Update UI for logged out user
  }
});
