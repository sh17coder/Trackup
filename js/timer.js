export class Timer {
  constructor(type) {
    this.type = type; // 'pomodoro' or 'stopwatch'
    this.isRunning = false;
    this.timeLeft = type === 'pomodoro' ? 25 * 60 : 0;
    this.interval = null;
    this.subject = '';
    this.topic = '';
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = new Date();
    
    this.interval = setInterval(() => {
      if (this.type === 'pomodoro') {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.stop();
          this.onComplete();
        }
      } else {
        this.timeLeft++;
      }
      this.updateDisplay();
    }, 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.interval);
    this.isRunning = false;
    
    if (this.type === 'stopwatch') {
      this.saveSession();
    }
  }

  reset() {
    this.stop();
    this.timeLeft = this.type === 'pomodoro' ? 25 * 60 : 0;
    this.updateDisplay();
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById(`${this.type}-display`).textContent = display;
  }

  saveSession() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const duration = this.timeLeft;
    const endTime = new Date();
    
    const sessionData = {
      type: this.type,
      subject: this.subject,
      topic: this.topic,
      duration,
      startTime: this.startTime,
      endTime: endTime,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(userId).collection('sessions')
      .add(sessionData)
      .catch(err => {
        console.error("Error saving session:", err);
      });
  }

  onComplete() {
    // Play sound or show notification
    if (this.type === 'pomodoro') {
      alert('Pomodoro session complete! Take a 5-minute break.');
    }
  }
}

// Initialize timers
export function initTimers() {
  const pomodoroTimer = new Timer('pomodoro');
  const stopwatchTimer = new Timer('stopwatch');
  
  // Set up UI controls
  document.getElementById('pomodoro-start').addEventListener('click', () => {
    pomodoroTimer.subject = document.getElementById('pomodoro-subject').value;
    pomodoroTimer.topic = document.getElementById('pomodoro-topic').value;
    pomodoroTimer.start();
  });
  
  document.getElementById('pomodoro-stop').addEventListener('click', () => pomodoroTimer.stop());
  document.getElementById('pomodoro-reset').addEventListener('click', () => pomodoroTimer.reset());
  
  document.getElementById('stopwatch-start').addEventListener('click', () => {
    stopwatchTimer.subject = document.getElementById('stopwatch-subject').value;
    stopwatchTimer.topic = document.getElementById('stopwatch-topic').value;
    stopwatchTimer.start();
  });
  
  document.getElementById('stopwatch-stop').addEventListener('click', () => stopwatchTimer.stop());
  document.getElementById('stopwatch-reset').addEventListener('click', () => stopwatchTimer.reset());
  
  // Update displays initially
  pomodoroTimer.updateDisplay();
  stopwatchTimer.updateDisplay();
}
