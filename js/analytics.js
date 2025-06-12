import { db, auth } from './firebase.js';
import Chart from 'chart.js/auto';

export function initAnalytics() {
  auth.onAuthStateChanged(user => {
    if (user) {
      loadStudySessions(user.uid);
      loadHabitProgress(user.uid);
    }
  });
}

function loadStudySessions(userId) {
  // Load last 30 days of sessions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  db.collection('users').doc(userId).collection('sessions')
    .where('endTime', '>=', thirtyDaysAgo)
    .orderBy('endTime')
    .get()
    .then(snapshot => {
      const sessions = snapshot.docs.map(doc => doc.data());
      renderStudyCharts(sessions);
    });
}

function renderStudyCharts(sessions) {
  // Group by date
  const dailyData = {};
  const subjectData = {};
  
  sessions.forEach(session => {
    const date = session.endTime.toDate().toISOString().split('T')[0];
    const durationHours = session.duration / 3600; // Convert seconds to hours
    
    // Daily totals
    if (!dailyData[date]) dailyData[date] = 0;
    dailyData[date] += durationHours;
    
    // By subject
    if (session.subject) {
      if (!subjectData[session.subject]) subjectData[session.subject] = 0;
      subjectData[session.subject] += durationHours;
    }
  });
  
  // Prepare data for Chart.js
  const dates = Object.keys(dailyData).sort();
  const dailyHours = dates.map(date => dailyData[date]);
  const subjects = Object.keys(subjectData);
  const subjectHours = subjects.map(subject => subjectData[subject]);
  
  // Time trend chart (line)
  const timeTrendCtx = document.getElementById('time-trend-chart').getContext('2d');
  new Chart(timeTrendCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Study Hours',
        data: dailyHours,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Daily Study Time'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          }
        }
      }
    }
  });
  
  // Subject distribution chart (pie)
  const subjectDistCtx = document.getElementById('subject-dist-chart').getContext('2d');
  new Chart(subjectDistCtx, {
    type: 'pie',
    data: {
      labels: subjects,
      datasets: [{
        data: subjectHours,
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Study Time by Subject'
        }
      }
    }
  });
}

function loadHabitProgress(userId) {
  db.collection('users').doc(userId).collection('habits')
    .get()
    .then(snapshot => {
      const habits = snapshot.docs.map(doc => doc.data());
      renderHabitCharts(habits);
    });
}

function renderHabitCharts(habits) {
  // Habit completion chart (bar)
  const habitCtx = document.getElementById('habit-completion-chart').getContext('2d');
  
  new Chart(habitCtx, {
    type: 'bar',
    data: {
      labels: habits.map(h => h.name),
      datasets: [{
        label: 'Completion %',
        data: habits.map(h => calculateProgress(h)),
        backgroundColor: 'rgb(16, 185, 129)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Habit Completion'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentage'
          }
        }
      }
    }
  });
}
