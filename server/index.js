const express = require("express");
const firebase = require("firebase");
const bodyParser = require("body-parser");

// system wide configs
// const firebaseConfig = {};
const port = 3000;
const app = express();
app.use(bodyParser.json());
// firebase.initializeApp(firebaseConfig);
// let db = firebase.firestore();

app.get("/", (req, res) => {
  res.send("Test");
});

app.listen(port, () => {
  console.log(`app is listening on port: ${port}`);
});
