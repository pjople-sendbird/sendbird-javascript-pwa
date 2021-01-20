/**
 * THIS IS YOUR SERVICE WORKER
 * ==============================
 * This will listen for messages when the browser TAB is closed.
 * 
 * "importScripts" works only for service workers.
 */
importScripts('https://www.gstatic.com/firebasejs/7.3.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.3.0/firebase-messaging.js');
const firebaseConfig = {
    messagingSenderId: "12345"
};
firebase.initializeApp(firebaseConfig);

/**
 * FIREBASE MESSAGING 
 * A new message from Sendbird will arrive here.
 */
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function (payload) {
    /**
     * YOU HAVE A NEW BACKGROUND MESSAGE.
     * THIS IS FOR WHEN YOUR TAB IS CLOSED.
     */
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    /**
     * When users click on notifications, 
     * open my application
     */
    self.addEventListener('notificationclick', function (event) {
        event.notification.close();
        clients.openWindow("http://localhost:5500"); /** << Change this for your URL */
    });

    /**
     * Show Notification to users
     */
    const channelName = JSON.parse(payload.data.sendbird).channel.name;
    const notificationTitle = `Background New message in ${channelName}`;
    var notificationOptions = {
        body: payload.data.message,
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

