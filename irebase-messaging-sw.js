importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyALR6o6lQzX_jR6mctmUWaHqlltUzfKkoc",
  authDomain: "civics-tracker-demo.firebaseapp.com",
  projectId: "civics-tracker-demo",
  storageBucket: "civics-tracker-demo.firebasestorage.app",
  messagingSenderId: "246778238801",
  appId: "1:246778238801:web:11e188c8925a307572a570",
  measurementId: "G-4MCCE825Z9"
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // Customize notification
  const notificationTitle = payload.notification.title || 'Civics Issue';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: payload.notification.icon || null,
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
