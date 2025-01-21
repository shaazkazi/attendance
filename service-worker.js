self.addEventListener('install', event => {
    console.log('Service Worker installed.');
  });
  
  self.addEventListener('push', event => {
    const options = {
      body: event.data ? event.data.text() : 'Time to mark your attendance!',
      icon: 'icon.png',
    };
    event.waitUntil(self.registration.showNotification('Attendance Reminder', options));
  });
  