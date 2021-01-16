const express = require("express");
const firebase = require("firebase");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

// system wide configs
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};
const port = 3000;
const app = express();

// system inits and hooks
app.use(bodyParser.json());

// firebase.initializeApp(firebaseConfig);

// let db = firebase.firestore();

app.get("/", (req, res) => {
  res.send("Test");
});

app.listen(port, () => {
  console.log(`app is listening on port: ${port}`);
});
