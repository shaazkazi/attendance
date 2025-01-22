const targetLocation = { lat: 25.2332593, lng: 51.4442569 }; // REDTAG Location
const thresholdDistance = 50; // Threshold in meters for arrival/departure
let hasEntered = false;
let hasExited = false;
let checkInTime = '09:00';
let checkOutTime = '18:00';

const subscribeButton = document.getElementById('subscribe');
const enableLocationButton = document.getElementById('enableLocation');
const testSoundButton = document.getElementById('testSound');
const statusDiv = document.getElementById('status');
const punchInDoneButton = document.getElementById('punchInDone');
const punchOutDoneButton = document.getElementById('punchOutDone');

let isPunchInDone = false;
let isPunchOutDone = false;
let punchInInterval;
let punchOutInterval;

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

function saveTimings() {
    const checkInInput = document.getElementById('checkInTime');
    const checkOutInput = document.getElementById('checkOutTime');
    
    checkInTime = checkInInput.value;
    checkOutTime = checkOutInput.value;
    
    localStorage.setItem('checkInTime', checkInTime);
    localStorage.setItem('checkOutTime', checkOutTime);
    
    clearInterval(punchInInterval);
    clearInterval(punchOutInterval);
    startPunchInReminders();
    startPunchOutReminders();
    
    statusDiv.textContent = '⏰ New timings saved successfully';
    statusDiv.style.display = 'block';
    statusDiv.className = 'status success';
}

function startLocationWatch() {
    hasEntered = false;
    hasExited = false;

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const distance = calculateDistance(latitude, longitude, targetLocation.lat, targetLocation.lng);
            
            console.log('Distance from REDTAG:', Math.round(distance), 'meters');

            if (distance <= thresholdDistance && !hasEntered) {
                hasEntered = true;
                hasExited = false;
                createNotification('Welcome to REDTAG', '🚩 You have arrived at the office. Time to mark your attendance!');
            } 
            else if (distance > thresholdDistance && hasEntered && !hasExited) {
                hasExited = true;
                hasEntered = false;
                createNotification('Leaving REDTAG', '📍 You are leaving the office. Don\'t forget to mark your exit!');
            }
        },
        (error) => {
            statusDiv.textContent = '📍 Location access needed: Please check your device settings';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status error';
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );

    statusDiv.textContent = '📡 Location tracking active - Range: 50 meters';
    statusDiv.style.display = 'block';
    statusDiv.className = 'status success';
    
    return watchId;
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
    if (!('Notification' in window)) {
        alert(message);
        return;
    }

    const options = {
        body: message,
        icon: 'icon512_rounded.png',
        badge: 'icon512_rounded.png',
        vibrate: [200, 100, 200],
        tag: 'attendance-reminder',
        renotify: true,
        requireInteraction: true
    };

    if (Notification.permission === 'granted') {
        playNotificationSound();
        return new Notification(title, options);
    }
}

function startPunchInReminders() {
    punchInInterval = setInterval(() => {
        const now = new Date();
        const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        if (currentHour === checkInHour && 
            currentMinute >= 0 && 
            currentMinute <= 30 && 
            !isPunchInDone) {
            createNotification(
                'Punch-In Reminder',
                `⏰ Time to punch in! Current time: ${now.toLocaleTimeString()}`
            );
        }
    }, 60000);
}

function startPunchOutReminders() {
    punchOutInterval = setInterval(() => {
        const now = new Date();
        const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        if (currentHour === checkOutHour && 
            currentMinute >= 0 && 
            currentMinute <= 30 && 
            !isPunchOutDone) {
            createNotification(
                'Punch-Out Reminder',
                `⏰ Time to punch out! Current time: ${now.toLocaleTimeString()}`
            );
        }
    }, 60000);
}

function resetPunchStatus() {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        isPunchInDone = false;
        isPunchOutDone = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedCheckIn = localStorage.getItem('checkInTime');
    const savedCheckOut = localStorage.getItem('checkOutTime');
    
    if (savedCheckIn) {
        checkInTime = savedCheckIn;
        document.getElementById('checkInTime').value = savedCheckIn;
    }
    if (savedCheckOut) {
        checkOutTime = savedCheckOut;
        document.getElementById('checkOutTime').value = savedCheckOut;
    }
});

subscribeButton.addEventListener('click', async () => {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            startPunchInReminders();
            startPunchOutReminders();
            statusDiv.textContent = '✅ Notifications enabled! You\'ll be reminded during punch windows.';
            statusDiv.style.display = 'block';
            statusDiv.className = 'status success';
        }
    }
});

enableLocationButton.addEventListener('click', () => {
    enableLocationTracking();
});

testSoundButton.addEventListener('click', async () => {
    if (!('Notification' in window)) {
        alert('Notifications not supported on this device');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await playNotificationSound();
            createNotification(
                'Test Notification',
                '✅ Notifications are working! Time: ' + new Date().toLocaleTimeString()
            );
            statusDiv.textContent = '🔔 Test notification sent successfully';
        } else {
            statusDiv.textContent = '⚠️ Please allow notifications first';
        }
        statusDiv.style.display = 'block';
        statusDiv.className = permission === 'granted' ? 'status success' : 'status error';
    } catch (error) {
        console.error('Test notification error:', error);
        statusDiv.textContent = '⚠️ Error: ' + error.message;
        statusDiv.style.display = 'block';
        statusDiv.className = 'status error';
    }
});

punchInDoneButton.addEventListener('click', () => {
    isPunchInDone = true;
    clearInterval(punchInInterval);
    statusDiv.textContent = '✅ Punch-in recorded successfully';
    statusDiv.style.display = 'block';
    statusDiv.className = 'status success';
});

punchOutDoneButton.addEventListener('click', () => {
    isPunchOutDone = true;
    clearInterval(punchOutInterval);
    statusDiv.textContent = '✅ Punch-out recorded successfully';
    statusDiv.style.display = 'block';
    statusDiv.className = 'status success';
});

document.getElementById('saveTimings').addEventListener('click', saveTimings);

setInterval(resetPunchStatus, 60000);

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

function enableLocationTracking() {
    if ('geolocation' in navigator) {
        // First check if permissions need to be requested
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'denied') {
                // Guide users to settings if permission was denied
                statusDiv.textContent = '📍 Please enable location in your device settings to use this feature';
                statusDiv.style.display = 'block';
                statusDiv.className = 'status error';
            } else {
                // Start tracking if permission is granted or prompt if not yet set
                startLocationWatch();
            }
        });
    } else {
        statusDiv.textContent = '⚠️ GPS tracking is not supported on your device.';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status error';
    }
}
document.getElementById('clearCache').addEventListener('click', async () => {
    try {
        // Clear all caches
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
        
        // Clear localStorage
        localStorage.clear();
        
        // Unregister service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        
        statusDiv.textContent = '✨ Cache cleared successfully! Reloading...';
        statusDiv.style.display = 'block';
        statusDiv.className = 'status success';
        
        // Reload the page after a brief delay
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    } catch (error) {
        console.error('Cache clearing error:', error);
        statusDiv.textContent = '⚠️ Error clearing cache: ' + error.message;
        statusDiv.style.display = 'block';
        statusDiv.className = 'status error';
    }
});
