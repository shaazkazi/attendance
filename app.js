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
    
    const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodHQqGlCN2Ca0dCmZ0A2Yq7i2apvRDhksOHWp21ENmS1492lbEI3Z7jo36NlQThmvOrfnWNAOGe/7OCSYz84aMHt4YxhPjhpw+7ghWA9OGrF7+CBXjw4a8fw4H5dOzhsyPHgeVs6OG3K8uB3Wjo4bsrz4HVaOThvzPTgdFk5OG/N9OBzWDk4cM714HJXODhxzvXgcVc4OHHO9eBwVjg4cs/24G9WODhz0PbgblU3OHTb+OhtVjc4dd754GxVNzh23/ngbFQ3OHfg+uBrUzc4eOH74GpTNjh54fvgaVI2OHri/OBpUjY4e+P84GhRNjh85PzgZ1E2OH3l/eBnUDU4fuX94GZQNTh/5v3gZU81OIDn/uBlTzU4gej+4GNONTWC6P7gYk41NoPp/+BhTjU2hOn/4GFNNTaF6v/gYE01Nobq/+BfTDU2h+v/4F5MNTaI7P/gXks1Nons/+BdSzU2iu3/4F1KNTaL7f/gXEo1No3u/+BbSjU2ju//4FpJNTaP7//gWUk1NpDv/+BZSDU2kfD/4FhINTaS8P/gWEc1NpPx/+BXRzU2lPH/4FZHNTaV8v/gVkY1Npby/+BVRjU2l/P/4FRGNTaY8//gVEU1Npnz/+BTRjU2mvT/4FJFNTab9P/gUkU1Npz1/+BRRjU2nfX/4FBGNTae9f/gUEU1Np/2/+BPRjU2oPb/4E5GNTah9v/gTkU1NqL3/+BNRjU2o/f/4E1FNTak+P/gTEU1NqX4/+BMRjU2pvj/4EtGNTan+P/gS0Y1Nqj5/+BKRjU2qfn/4EpFNTaq+f/gSUY1Nqv6/+BJRjU2rPr/4EhGNTat+v/gSEU1Nq77/+BHRjU2r/v/4EdFNTaw+//gRkY1NrH7/+BGRjU2svv/4EVGNTaz/P/gRUY1NrT8/+BERjU2tfz/4ERFNTa2/P/gQ0Y1Nrf9/+BDRjU2uP3/4EJGNTa5/f/gQkU1Nrr9/+BBRjU2u/3/4EFFNTa8/v/gQEY1Nr3+/+BARjU2vv7/4D9GNTY=';

    function playNotificationSound() {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.volume = 1.0; // Maximum volume
    
        // Play the sound with both promise and traditional approach
        const playPromise = audio.play();
    
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Fallback to a different play method if needed
                setTimeout(() => audio.play(), 100);
            });
        }
    }

    function createNotification(title, message) {
        // Play sound first
        playNotificationSound();
    
        // Then show notification
        return new Notification(title, {
            body: message,
            icon: 'icon512_rounded.png',
            badge: 'icon512_rounded.png',
            vibrate: [200, 100, 200],
            silent: false,
            requireInteraction: true // Makes notification persist until user interacts
        });
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

const testButton = document.getElementById('testSound');

testButton.addEventListener('click', async () => {
    if (Notification.permission === 'granted') {
        createNotification('Sound Test', '🔊 Testing notification sound!');
        statusDiv.textContent = '🔔 Test notification sent!';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status success';
    } else {
        // If notifications aren't enabled yet, request permission first
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            createNotification('Sound Test', '🔊 Testing notification sound!');
            statusDiv.textContent = '🔔 Test notification sent!';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status success';
        }
    }
});

function createNotification(title, message) {
    const notification = new Notification(title, {
        body: message,
        icon: 'icon512_rounded.png',
        badge: 'icon512_rounded.png',
        vibrate: [200, 100, 200],
        silent: false
    });
    
    // Play sound when notification is shown
    playNotificationSound();
}
