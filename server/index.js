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

const USER_NOT_FOUND = "User Not Found";
const USER_CREATED = "User Created";
const USERT_UPDATED = "User Updated";
const USER_DELETED = "User Deleted";
const GOOGLE_API_ERROR = "Server Error when calling google APIs";

// routes
const patientRootPath = "/patient";

app.get(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    return res.status(status.OK).json(rsp);
  } else if (rsp == false) {
    return res.status(status.NOT_FOUND).json({ msg: USER_NOT_FOUND });
  } else {
    return res.status(status.SERVER_ERROR).append(GOOGLE_API_ERROR);
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
      .set(req.body)
      .then(function () {
        return res.status(status.OK).json({ msg: USER_CREATED });
      })
      .catch(function (error) {
        return res.status(status.SERVER_ERROR).json({ msg: error.message });
      });
  } else {
    return res.status(status.SERVER_ERROR);
  }
});

app.put(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    let patientId = req.body.patientId;
    let docRef = db.collection(PATIENT_COLLECTION_NAME).doc(patientId);
    docRef
      .set(req.body)
      .then(function () {
        return res.status(status.OK).json({ msg: USERT_UPDATED });
      })
      .catch(function (error) {
        return res.status(status.SERVER_ERROR).json({ msg: error.message });
      });
  } else if (rsp == false) {
    return res.status(status.NOT_FOUND).json({ msg: USER_NOT_FOUND });
  } else {
    return res.status(status.SERVER_ERROR).append(GOOGLE_API_ERROR);
  }
});

app.delete(patientRootPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    const result = await db
      .collection(PATIENT_COLLECTION_NAME)
      .doc(req.body.patientId)
      .delete();
    return res.status(status.OK).json({ msg: USER_DELETED });
  } else if (rsp == false) {
    return res.status(status.OK).json({ msg: USER_NOT_FOUND });
  } else {
    return res.status(status.SERVER_ERROR).append(GOOGLE_API_ERROR);
  }
});

app.get("viewAnalytics/:patientId", (req, res) => {
  let patientId = req.params.patientId;
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

app.listen(port, () => {
  console.log(`app is listening on port: ${port}`);
});
