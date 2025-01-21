const subscribeButton = document.getElementById('subscribe');
const statusDiv = document.getElementById('status');

subscribeButton.addEventListener('click', async () => {
  if ('Notification' in window) {
      const permission = await Notification.requestPermission();
        
      if (permission === 'granted') {
          statusDiv.textContent = 'Notifications enabled!';
          statusDiv.style.display = 'block';
          statusDiv.className = 'status success';
            
          // Test notification
          new Notification('Attendance Reminder', {
              body: 'Notifications are now enabled!',
              icon: 'icon512_rounded.png'
          });
      } else {
          statusDiv.textContent = 'Please allow notifications to use this app';
          statusDiv.style.display = 'block';
          statusDiv.className = 'status error';
      }
  }
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
          console.log('Service Worker registered');
      })
      .catch(error => {
          console.log('Service Worker registration failed:', error);
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