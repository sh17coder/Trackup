import { db, auth } from './firebase.js';

export function initSharing() {
  // Get current user's share code
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('users').doc(user.uid).get()
        .then(doc => {
          const userCode = doc.data().userCode;
          document.getElementById('user-code').textContent = userCode;
          
          // Generate shareable link
          const shareLink = `${window.location.origin}/view.html?user=${userCode}`;
          document.getElementById('share-link').value = shareLink;
          
          // Copy link button
          document.getElementById('copy-link').addEventListener('click', () => {
            navigator.clipboard.writeText(shareLink);
            alert('Link copied to clipboard!');
          });
        });
    }
  });
  
  // View shared dashboard
  if (window.location.pathname.includes('view.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const userCode = urlParams.get('user');
    
    if (userCode) {
      loadSharedData(userCode);
    } else {
      document.getElementById('shared-content').innerHTML = `
        <p class="text-red-500">No user code provided. Please use a valid share link.</p>
      `;
    }
  }
}

function loadSharedData(userCode) {
  // Find user by code
  db.collection('users').where('userCode', '==', userCode).get()
    .then(snapshot => {
      if (snapshot.empty) {
        document.getElementById('shared-content').innerHTML = `
          <p class="text-red-500">User not found. Please check the share link.</p>
        `;
        return;
      }
      
      const userId = snapshot.docs[0].id;
      loadSharedHabits(userId);
      loadSharedSessions(userId);
    });
}

function loadSharedHabits(userId) {
  db.collection('users').doc(userId).collection('habits')
    .get()
    .then(snapshot => {
      const habitsContainer = document.getElementById('shared-habits');
      habitsContainer.innerHTML = '';
      
      if (snapshot.empty) {
        habitsContainer.innerHTML = '<p>No habits to display.</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const habit = doc.data();
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
        `;
        habitsContainer.appendChild(habitEl);
      });
    });
}

function loadSharedSessions(userId) {
  // Load last 7 days of sessions
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  db.collection('users').doc(userId).collection('sessions')
    .where('endTime', '>=', sevenDaysAgo)
    .orderBy('endTime')
    .get()
    .then(snapshot => {
      const sessionsContainer = document.getElementById('shared-sessions');
      sessionsContainer.innerHTML = '';
      
      if (snapshot.empty) {
        sessionsContainer.innerHTML = '<p>No recent study sessions.</p>';
        return;
      }
      
      let totalHours = 0;
      const sessionsByDay = {};
      
      snapshot.forEach(doc => {
        const session = doc.data();
        const date = session.endTime.toDate().toLocaleDateString();
        const durationHours = session.duration / 3600;
        totalHours += durationHours;
        
        if (!sessionsByDay[date]) sessionsByDay[date] = 0;
        sessionsByDay[date] += durationHours;
      });
      
      // Display summary
      const summaryEl = document.createElement('div');
      summaryEl.className = 'mb-6';
      summaryEl.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">Study Summary (Last 7 Days)</h3>
        <p class="text-lg">Total: <span class="font-bold">${totalHours.toFixed(1)}</span> hours</p>
      `;
      sessionsContainer.appendChild(summaryEl);
      
      // Display daily breakdown
      const days = Object.keys(sessionsByDay).sort();
      days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'mb-2';
        dayEl.innerHTML = `
          <p>${day}: <span class="font-semibold">${sessionsByDay[day].toFixed(1)} hours</span></p>
        `;
        sessionsContainer.appendChild(dayEl);
      });
    });
        }
