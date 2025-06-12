import { initHabitTracker } from './js/tracker.js';
import { initTimers } from './js/timer.js';
import { initAnalytics } from './js/analytics.js';
import { initSharing } from './js/share.js';

// Initialize dark/light mode toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHabitTracker();
  initTimers();
  initAnalytics();
  initSharing();
  
  // Optional: Load motivational quote
  if (document.getElementById('motivational-quote')) {
    fetch('https://api.quotable.io/random?tags=motivational')
      .then(response => response.json())
      .then(data => {
        document.getElementById('motivational-quote').textContent = `"${data.content}" — ${data.author}`;
      })
      .catch(() => {
        document.getElementById('motivational-quote').textContent = 
          '"The secret of getting ahead is getting started." — Mark Twain';
      });
  }
});
