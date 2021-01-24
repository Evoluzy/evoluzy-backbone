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

// routes
const patientRootPath = "/patient";

app.get(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    return res.status(status.OK).json(rsp);
  } else if (rsp == false) {
    return res.status(status.NOT_FOUND).json({});
  } else {
    return res
      .status(status.SERVER_ERROR)
      .append("Error in calling google apis");
  }
});

app.post(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    return res.status(status.CONFLICT).json({});
  } else if (rsp == false) {
    let patientId = req.body.patientId;
    let docRef = db.collection(PATIENT_COLLECTION_NAME).doc(patientId);
    docRef
      .set({
        test: "hello",
        name: "osama",
      })
      .then(function () {
        console.log("Document successfully written!");
        return res.status(status.OK).json({});
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
        return res.status(status.SERVER_ERROR).json({});
      });
  } else {
    return res
      .status(status.SERVER_ERROR)
      .append("Error in calling google apis");
  }
});

app.put(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    return res.status(status.OK).json(rsp);
  } else if (rsp == false) {
    let patientId = req.body.patientId;
    let docRef = db.collection(PATIENT_COLLECTION_NAME).doc(patientId);
    docRef
      .set({
        test: "hello-from-put",
        name: "yesh",
      })
      .then(function () {
        console.log("User successfully created!");
        return res.status(status.OK).json({});
      })
      .catch(function (error) {
        console.error("Error creating User", error);
        return res.status(status.SERVER_ERROR).json({});
      });
  } else {
    return res
      .status(status.SERVER_ERROR)
      .append("Error in calling google apis");
  }
});

app.delete(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    const result = await db
      .collection(PATIENT_COLLECTION_NAME)
      .doc(req.body.patientId)
      .delete();
    console.log(result);
    return res.status(status.OK).json({});
  } else if (rsp == false) {
    return res.status(status.OK).json({});
  } else {
    return res.status(status.SERVER_ERROR).json({});
  }
});

app.get("viewAnalytics/:patientId", (req, res) => {
  let patientId = req.params.patientId;
  console.log(patientId);
  res.status(200);
});
//helper functions

async function isPatientExist(req) {
  let patientId = req.body.patientId;
  let docRef = db.collection(PATIENT_COLLECTION_NAME).doc(patientId);
  try {
    let patient = await docRef.get();
    if (patient.exists) {
      return patient.data();
    } else {
      return false;
    }
  } catch (err) {
    return err;
  }
}

async function createUser(req) {}

app.listen(port, () => {
  console.log(`app is listening on port: ${port}`);
});
