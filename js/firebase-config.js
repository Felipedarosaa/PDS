// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB_4YZBexkRaGndodh16S3qOJbqc8zpgDU",
  authDomain: "projeto-gigatonico.firebaseapp.com",
  projectId: "projeto-gigatonico",
  storageBucket: "projeto-gigatonico.firebasestorage.app",
  messagingSenderId: "14300053670",
  appId: "1:14300053670:web:2f1449e7d3971a81a83467",
  measurementId: "G-PD7YQPTWKR"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Exportar para uso em outros arquivos
window.db = db;
window.auth = auth;