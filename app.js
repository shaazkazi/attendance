const subscribeButton = document.getElementById('subscribe');
const statusDiv = document.getElementById('status');

// Schedule notifications for specific times
function scheduleNotifications() {
    const now = new Date();
    
    // Morning notification - 9:30 AM
    const morningTime = new Date();
    morningTime.setHours(9, 30, 0);
    
    // Evening notification - 6:00 PM
    const eveningTime = new Date();
    eveningTime.setHours(18, 0, 0);
    
    function playNotificationSound() {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play();
    }

    function createNotification(title, message) {
        new Notification(title, {
            body: message,
            icon: 'icon512_rounded.png',
            badge: 'icon512_rounded.png',
            vibrate: [200, 100, 200],
            silent: false
        });
        playNotificationSound();
    }

    function scheduleNotification(time, message) {
        if (now > time) {
            time.setDate(time.getDate() + 1);
        }
        
        const timeUntilNotification = time.getTime() - now.getTime();
        
        setTimeout(() => {
            createNotification('Attendance Reminder', message);
            scheduleNotification(time, message);
        }, timeUntilNotification);
    }
    
    scheduleNotification(morningTime, '🌅 Good morning! Time to mark your attendance for the day.');
    scheduleNotification(eveningTime, '🌆 End of day! Don\'t forget to mark your exit time.');
}

subscribeButton.addEventListener('click', async () => {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            statusDiv.textContent = '✅ Notifications enabled! You\'ll be reminded at 9:30 AM and 6:00 PM';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status success';
            
            // Welcome notification
            new Notification('Attendance Reminder', {
                body: '🎉 Setup complete! You\'ll receive daily reminders at 9:30 AM and 6:00 PM',
                icon: 'icon512_rounded.png'
            });
            
            scheduleNotifications();
        } else {
            statusDiv.textContent = '⚠️ Please allow notifications to use this app';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status error';
        }
    }
});

// Enhanced service worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('✨ Service Worker registered successfully');
        })
        .catch(error => {
            console.log('❌ Service Worker registration failed:', error);
        });
}

// Add sound test functionality
document.getElementById('testSound').addEventListener('click', () => {
    createNotification('Sound Test', '🔊 Testing notification sound!');
});
