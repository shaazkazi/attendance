const targetLocation = { lat: 25.2332593, lng: 51.4442569 }; // REDTAG Location
const thresholdDistance = 50; // Threshold in meters for arrival/departure
let hasEntered = false;
let hasExited = false;

const subscribeButton = document.getElementById('subscribe');
const enableLocationButton = document.getElementById('enableLocation');
const testSoundButton = document.getElementById('testSound');
const statusDiv = document.getElementById('status');

// Utility to calculate distance between two GPS coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function enableLocationTracking() {
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            const distance = calculateDistance(latitude, longitude, targetLocation.lat, targetLocation.lng);

            if (distance <= thresholdDistance && !hasEntered) {
                hasEntered = true;
                hasExited = false;
                createNotification('Arrival', '🚩 You have reached REDTAG. Don\'t forget to mark your attendance!');
            } else if (distance > thresholdDistance && !hasExited) {
                hasExited = true;
                hasEntered = false;
                createNotification('Departure', '📍 You are leaving REDTAG. Make sure to mark your exit attendance!');
            }
        }, (error) => {
            console.error('Error watching position:', error);
            statusDiv.textContent = '⚠️ Error tracking location: ' + error.message;
            statusDiv.className = 'status error';
            statusDiv.style.display = 'block';
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        });

        statusDiv.textContent = '📡 GPS tracking enabled! Notifications will be sent on arrival and departure.';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status success';
    } else {
        statusDiv.textContent = '⚠️ GPS tracking is not supported on your device.';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status error';
    }
}

const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodHQqGlCN2Ca0dCmZ0A2Yq7i2apvRDhksOHWp21ENmS1492lbEI3Z7jo36NlQThmvOrfnWNAOGe/7OCSYz84aMHt4YxhPjhpw+7ghWA9OGrF7+CBXjw4a8fw4H5dOzhsyPHgeVs6OG3K8uB3Wjo4bsrz4HVaOThvzPTgdFk5OG/N9OBzWDk4cM714HJXODhxzvXgcVc4OHHO9eBwVjg4cs/24G9WODhz0PbgblU3OHTb+OhtVjc4dd754GxVNzh23/ngbFQ3OHfg+uBrUzc4eOH74GpTNjh54fvgaVI2OHri/OBpUjY4e+P84GhRNjh85PzgZ1E2OH3l/eBnUDU4fuX94GZQNTh/5v3gZU81OIDn/uBlTzU4gej+4GNONTWC6P7gYk41NoPp/+BhTjU2hOn/4GFNNTaF6v/gYE01Nobq/+BfTDU2h+v/4F5MNTaI7P/gXks1Nons/+BdSzU2iu3/4F1KNTaL7f/gXEo1No3u/+BbSjU2ju//4FpJNTaP7//gWUk1NpDv/+BZSDU2kfD/4FhINTaS8P/gWEc1NpPx/+BXRzU2lPH/4FZHNTaV8v/gVkY1Npby/+BVRjU2l/P/4FRGNTaY8//gVEU1Npnz/+BTRjU2mvT/4FJFNTab9P/gUkU1Npz1/+BRRjU2nfX/4FBGNTae9f/gUEU1Np/2/+BPRjU2oPb/4E5GNTah9v/gTkU1NqL3/+BNRjU2o/f/4E1FNTak+P/gTEU1NqX4/+BMRjU2pvj/4EtGNTan+P/gS0Y1Nqj5/+BKRjU2qfn/4EpFNTaq+f/gSUY1Nqv6/+BJRjU2rPr/4EhGNTat+v/gSEU1Nq77/+BHRjU2r/v/4EdFNTaw+//gRkY1NrH7/+BGRjU2svv/4EVGNTaz/P/gRUY1NrT8/+BERjU2tfz/4ERFNTa2/P/gQ0Y1Nrf9/+BDRjU2uP3/4EJGNTa5/f/gQkU1Nrr9/+BBRjU2u/3/4EFFNTa8/v/gQEY1Nr3+/+BARjU2vv7/4D9GNTY=';

function playNotificationSound() {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 1.0;
    return audio.play().catch(error => {
        console.error("Error playing notification sound:", error);
    });
}

function createNotification(title, message) {
    if (Notification.permission === 'granted') {
        playNotificationSound();
        return new Notification(title, {
            body: message,
            icon: 'icon512_rounded.png',
            badge: 'icon512_rounded.png',
            vibrate: [200, 100, 200],
            silent: false,
            requireInteraction: true
        });
    }
}

function scheduleNotifications() {
    try {
        const now = new Date();
        const morningTime = new Date();
        morningTime.setHours(9, 0, 0);
        const eveningTime = new Date();
        eveningTime.setHours(18, 0, 0);

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
        
        statusDiv.textContent = '⏰ Daily notifications scheduled for 9:30 AM and 6:00 PM';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status success';
    } catch (error) {
        console.error('Scheduling error:', error);
        statusDiv.textContent = '⚠️ Error scheduling notifications';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status error';
    }
}

subscribeButton.addEventListener('click', async () => {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            statusDiv.textContent = '✅ Notifications enabled! You\'ll be reminded at 9:30 AM and 6:00 PM.';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status success';
            createNotification('Attendance Reminder', '🎉 Setup complete! Daily reminders are now active.');
            scheduleNotifications();
        } else {
            statusDiv.textContent = '⚠️ Please allow notifications to use this app.';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status error';
        }
    }
});

enableLocationButton.addEventListener('click', () => {
    enableLocationTracking();
});

testSoundButton.addEventListener('click', () => {
    createNotification("Test", "This is a test notification with sound!");
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('✨ Service Worker registered with scope:', registration.scope);
            statusDiv.textContent = '✨ Service Worker registered successfully';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status success';
        })
        .catch(error => {
            console.error('❌ Service Worker registration failed:', error);
            statusDiv.textContent = '❌ Service Worker registration failed';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status error';
        });
}
