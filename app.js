if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(() => {
      console.log('Service Worker Registered');
    });
  }
  
  if ('Notification' in window) {
    Notification.requestPermission()
      .then(permission => {
        if (permission === 'granted') {
          registerPeriodicNotifications();
        }
      });
  }
  
  function scheduleNotifications() {
    const options = { body: 'Time to punch your attendance!', icon: 'icon.png' };
    const times = ['09:30', '18:00']; // 9:30 AM & 6:00 PM
  
    times.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0);
  
      if (reminderTime > now) {
        setTimeout(() => {
          new Notification('Attendance Reminder', options);
        }, reminderTime - now);
      }
    });
  }
  