const express = require("express");
const firebase = require("firebase");
const status = require("http-status");
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
const PATIENT_COLLECTION_NAME = "patients-data";
const app = express();

// system inits and hooks
app.use(bodyParser.json());
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();
const patientCollectionRef = db.collection("evoluzy");

// routes
const patientRootPath = "/patient";

app.get(patientRootPath, async (req, res) => {
  let patientId = req.body.patientId;
  let docRef = db.collection(PATIENT_COLLECTION_NAME).doc(patientId);
  try {
    let patient = await docRef.get();
    if (patient.exists) {
      res.status(status.OK).json(patient.data());
    } else {
      return res.status(status.NOT_FOUND).json({});
    }
  } catch (err) {
    return res
      .status(status.SERVER_ERROR)
      .append("Error in calling google apis");
  }
});

app.post(patientRootPath, (req, res) => {
  // userExist in db ? return status.CONFLICT : create user in db
  res.send("POST request to the homepage");
});

app.put(patientRootPath, (req, res) => {
  // userExist in db ? update patient doc  with patientID : create user in db
  res.send("put request to the homepage");
});

app.delete(patientRootPath, (req, res) => {
  // userExist in db ? delete user : return 200 in both cases
  res.send("delete request to the homepage");
});

app.listen(port, () => {
  console.log(`app is listening on port: ${port}`);
});
