"use client"
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; // ✅ Add this
import { getFirestore } from "firebase/firestore";
import { Anonymous_Pro } from "next/font/google";
import { useEffect } from "react";
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from "firebase/messaging";
const firebaseConfig = {
  apiKey: "AIzaSyAd1h_AoSP8N7tv0FE5dOQu4H5oeCPsC6I",
  authDomain: "my-mneti.firebaseapp.com",
  databaseURL: "https://my-mneti.firebaseio.com",
  projectId: "my-mneti",
  storageBucket: "my-mneti.firebasestorage.app",
  messagingSenderId: "463164559477",
  appId: "1:463164559477:web:16037cedf35ad1982a283c",
  measurementId: "G-CLR3VGQE11"

};

const firebaseConfig2 = {
  apiKey: "AIzaSyAFzU496m10iRJIoMqhLr1i3tkLwa_YFB8",
  authDomain: "project-e1ce7.firebaseapp.com",
  databaseURL: "https://project-e1ce7-default-rtdb.firebaseio.com",
  projectId: "project-e1ce7",
  storageBucket: "project-e1ce7.firebasestorage.app",
  messagingSenderId: "525807938165",
  appId: "1:525807938165:web:e27158861295199db4e63c",
  measurementId: "G-GQK43KNWGW"

};

const firebaseConfig3 = {

  apiKey: "AIzaSyBhGwdqw9i_O5SjRJEZXA6Nc3ho5MGpDDs",
  authDomain: "blaz-43c61.firebaseapp.com",
  databaseURL: "https://blaz-43c61-default-rtdb.firebaseio.com",
  projectId: "blaz-43c61",
  storageBucket: "blaz-43c61.firebasestorage.app",
  messagingSenderId: "9929303497",
  appId: "1:9929303497:web:6f32f68135acda6e807418",
  measurementId: "G-RH8JTLJ59E"
};

const firebaseConfig4 = {
 apiKey: "AIzaSyBydhBC9lV8R4nRZbf9WPkrU2kk9QMRO9o",
  authDomain: "bios-610ea.firebaseapp.com",
  databaseURL: "https://bios-610ea-default-rtdb.firebaseio.com",
  projectId: "bios-610ea",
  storageBucket: "bios-610ea.firebasestorage.app",
  messagingSenderId: "28047023223",
  appId: "1:28047023223:web:2700728ff58891bdc27a72",
  measurementId: "G-56YFR9TFYL"
};



const firebaseConfig5 = {
  apiKey: "AIzaSyBZilD5pYSi0wst-p8BpEC0A0aN0nCiG90",
  authDomain: "global-tongue.firebaseapp.com",
  projectId: "global-tongue",
  storageBucket: "global-tongue.firebasestorage.app",
  messagingSenderId: "204343555001",
  appId: "1:204343555001:web:dec0a1628f1403c6a37c68"
};

const firebaseConfig6 = {
  apiKey: "AIzaSyC_daPe-IIdAKzKZNPC5zAs42bPNCgLznM",
  authDomain: "blueray-503d6.firebaseapp.com",
  databaseURL: "https://blueray-503d6-default-rtdb.firebaseio.com",
  projectId: "blueray-503d6",
  storageBucket: "blueray-503d6.firebasestorage.app",
  messagingSenderId: "802583127809",
  appId: "1:802583127809:web:70fc4739637fc715dc9d00",
  measurementId: "G-RC1P8VQ6ZD"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const app2 = initializeApp(firebaseConfig2, "app2"); // 
const app3 = initializeApp(firebaseConfig3, "app3"); // 
const app4 = initializeApp(firebaseConfig4, "app4"); // 
const app5 = initializeApp(firebaseConfig5, "app5"); // 
const app6 = initializeApp(firebaseConfig6, "app6"); // 


export const rtdb = getDatabase(app6); // 

// ✅ Initialize both services
// const db = getDatabase(app);
const auth = getAuth(app); // <-- Auth  here
 const db = getFirestore(app); //

const dbb =getFirestore(app2)

const dbc =getFirestore(app3)
const dbd =getFirestore(app4)
const dbe =getFirestore(app5)




export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};


// ✅ Export both
export { dbb,db, auth, app2, dbc, dbd,dbe };

