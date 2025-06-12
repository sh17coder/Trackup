import { db, auth, realtimeDb } from './firebase.js';

// Initialize habit tracker
export function initHabitTracker() {
  auth.onAuthStateChanged(user => {
    if (user) {
      loadHabits(user.uid);
      setupHabitForm(user.uid);
    }
  });
}

// Load user's habits
function loadHabits(userId) {
  db.collection('users').doc(userId).collection('habits')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const habitsContainer = document.getElementById('habits-container');
      habitsContainer.innerHTML = '';
      
      snapshot.forEach(doc => {
        const habit = doc.data();
        renderHabit(habit, doc.id);
      });
    });
}

// Render a habit item
function renderHabit(habit, habitId) {
  const habitsContainer = document.getElementById('habits-container');
  
  const habitEl = document.createElement('div');
  habitEl.className = 'habit-item p-4 mb-4 rounded-lg shadow';
  habitEl.innerHTML = `
    <h3 class="text-xl font-semibold">${habit.name}</h3>
    <p class="text-gray-600">${habit.description || ''}</p>
    <div class="habit-progress mt-2">
      <div class="progress-bar bg-blue-200 rounded-full h-4">
        <div class="progress-fill bg-blue-500 h-4 rounded-full" style="width: ${calculateProgress(habit)}%"></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-sm">${habit.currentValue || 0} / ${habit.targetValue || '∞'}</span>
        <span class="text-sm">${calculateProgress(habit)}%</span>
      </div>
    </div>
    <div class="habit-actions mt-3 flex space-x-2">
      <button class="increment-btn px-3 py-1 bg-green-500 text-white rounded" data-value="1">+1</button>
      <button class="increment-btn px-3 py-1 bg-green-600 text-white rounded" data-value="5">+5</button>
      <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded">Delete</button>
    </div>
  `;
  
  // Add event listeners
  habitEl.querySelectorAll('.increment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const incrementValue = parseInt(btn.dataset.value);
      updateHabitValue(user.uid, habitId, incrementValue);
    });
  });
  
  habitEl.querySelector('.delete-btn').addEventListener('click', () => {
    deleteHabit(user.uid, habitId);
  });
  
  habitsContainer.appendChild(habitEl);
}

// Set up form to add new habits
function setupHabitForm(userId) {
  const form = document.getElementById('add-habit-form');
  if (!form) return;
  
  form.addEventListener('submit', e => {
    e.preventDefault();
    
    const name = form['habit-name'].value;
    const description = form['habit-description'].value;
    const targetValue = form['habit-target'].value || null;
    
    const newHabit = {
      name,
      description,
      targetValue: targetValue ? parseInt(targetValue) : null,
      currentValue: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(userId).collection('habits')
      .add(newHabit)
      .then(() => {
        form.reset();
      })
      .catch(err => {
        console.error("Error adding habit:", err);
      });
  });
}

// Helper functions
function calculateProgress(habit) {
  if (!habit.targetValue) return 0;
  return Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100));
}

function updateHabitValue(userId, habitId, increment) {
  const habitRef = db.collection('users').doc(userId).collection('habits').doc(habitId);
  
  db.runTransaction(transaction => {
    return transaction.get(habitRef).then(doc => {
      if (!doc.exists) throw "Document does not exist!";
      
      const newValue = (doc.data().currentValue || 0) + increment;
      transaction.update(habitRef, { currentValue: newValue });
    });
  }).catch(err => {
    console.error("Transaction failed:", err);
  });
}

function deleteHabit(userId, habitId) {
  db.collection('users').doc(userId).collection('habits').doc(habitId)
    .delete()
    .catch(err => {
      console.error("Error deleting habit:", err);
    });
}
