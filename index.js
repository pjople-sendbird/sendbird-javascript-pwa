/**
 * Your web app's Firebase configuration.
 * For Firebase JS SDK v7.20.0 and later, measurementId is optional
 * https://console.firebase.google.com
 */
var firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "..."
};

/**
 * Initialize Firebase
 */
firebase.initializeApp(firebaseConfig);
firebase.analytics();

/**
 * Init Firebase Messaging
 */
const messaging = firebase.messaging();
/**
 * Get this by going to 
 * https://console.firebase.google.com/u/0/project/YOUR-PROJECT-ID/settings/cloudmessaging/
 * 
 * Under: Web Push certificates, get your "Key pair" key.
 * 
 */
messaging.usePublicVapidKey(
    '...'
);

/**
 * Define this from: https://dashboard.sendbird.com
 */
var appId = '...';
var userId = '...';
var nickname = '...';
var UNIQUE_HANDLER_ID = '12345678';

/**
 * Initialize SendBird
 */
const sb = new SendBird({ appId });

/**
 * Connect to Websocket
 */
sb.connect(userId, nickname, (user, error) => {
    /**
     * Request permission to send notification in this browser
     */
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            /**
             * We have permission from user
             */
            messaging
                .getToken()
                .then(currentToken => {
                    if (currentToken) {
                        /**
                         * This is your token from Firebase
                         */
                        console.log(currentToken)
                        /**
                         * Register this token in Sendbird
                         */
                        sb.registerGCMPushTokenForCurrentUser(currentToken, (response, error) => {
                            if (error) console.log(error)
                        });
                    }
                })
                .catch(err => {
                    console.log('An error occurred while retrieving token. ', err);
                });
        } else {
            console.log('Unable to get permission to notify.');
        }
    })
})

/**
 * If Firebase require a token refresh,
 * then this function is called. 
 * We send our token again to SendBird.
 */
messaging.onTokenRefresh(() => {
    messaging
        .getToken()
        .then(refreshedToken => {
            SendBirdAction.getInstance().registerGCMPushTokenForCurrentUser(refreshedToken)
                .then(response => console.log('Successfully registered token with SendBird.', response))
                .catch(error => console.log('Could not register token with SendBird.', error));
        })
        .catch(err => {
            console.log('Unable to retrieve refreshed token ', err);
        });
});


/**
 * Receiving Message from SendBird Channel Handler.
 * This works when this browser TAB is opened and active. 
 */
const ChannelHandler = new sb.ChannelHandler();
ChannelHandler.onMessageReceived = function (channel, message) {
    // Consider calling the Notification service from here. 
    console.log('New message:')
    console.dir(message);
};
/**
 * Register a handler and wait for events. More info here:
 * https://sendbird.com/docs/chat/v3/javascript/guides/event-handler#1-event-handler
 */
sb.addChannelHandler(UNIQUE_HANDLER_ID, ChannelHandler);

/**
 * This is the most important step for PWA.
 * We register our Service Worker.
 * This will listen messages when this Browser TAB is closed.
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('firebase-messaging-sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}


