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
const SLEEP_ACTIVITY_TYPE_INDICATOR = 72;
// routes
const patientRootPath = "/patient";
const viewAnalyticsPath = "/viewAnalytics";

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

app.get(viewAnalyticsPath, async (req, res) => {
  let rsp = await isPatientExist(req);
  if (rsp) {
    let resultObj = await formatPatientHealthEvents(rsp);
    return res.status(status.OK).json(resultObj);
  } else if (rsp == false) {
    return res.status(status.USER_NOT_FOUND).json({ msg: USER_NOT_FOUND });
  } else {
    return res.status(status.SERVER_ERROR).append(GOOGLE_API_ERROR);
  }
});
//helper functions
async function formatPatientHealthEvents(rsp) {
  let resultObj = {};
  resultObj.patientName = rsp.patientName;
  resultObj.isArchived = rsp.isArchived;
  resultObj.patientId = rsp.patientId;
  resultObj.isApproved = rsp.isApproved;
  // construct the sleep array.
  let sleepEventsFormated = formatSleepEvents(rsp.healthData.session);
  resultObj.sleep = sleepEventsFormated;
  let { heartMinutes, caloriesBurned, step } = formatNonSessionData(
    rsp.healthData.non_session
  );
  resultObj.heartMinutes = heartMinutes;
  resultObj.caloriesBurned = caloriesBurned;
  resultObj.step = step;
  return resultObj;
}

function getTimeHHMMSS(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  return hours + ":" + minutes + ":" + seconds;
}
function getDayDDMM(date) {
  let days = date.getDate();
  let months = date.getMonth() + 1;
  days = days < 10 ? "0" + days : days;
  months = months < 10 ? "0" + months : months;
  return days + "/" + months;
}
function getFloatDiff(start, end) {
  let duration = end - start;
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return hours + minutes / 60;
}
function formatSleepEvents(session) {
  let sleep = [];
  session.forEach((event) => {
    if (event.activityType === SLEEP_ACTIVITY_TYPE_INDICATOR) {
      let obj = {};
      let startTime = new Date(parseInt(event.startTimeMillis));
      let endTime = new Date(parseInt(event.endTimeMillis));
      obj.date = getDayDDMM(startTime);
      obj.start = getTimeHHMMSS(startTime);
      obj.end = getTimeHHMMSS(endTime);
      obj.hours = getFloatDiff(event.startTimeMillis, event.endTimeMillis);
      sleep.push(obj);
    }
  });
  return sleep;
}
function formatNonSessionData(non_session) {
  // this is a dummy data (for the sake of testing only)
  heartMinutes = [
    {
      date: "18/01",
      points: 0,
    },
    {
      date: "17/01",
      points: 0,
    },
  ];
  caloriesBurned = [
    {
      date: "18/01",
      calories: 26.4,
    },
    {
      date: "17/01",
      calories: 26,
    },
  ];
  step = {
    weeklyAverage: [
      {
        label: "10/01-16/01",
        average: "80",
      },
      {
        label: "03/01-09/01",
        average: "96",
      },
    ],
    daily: [
      {
        date: "18/01",
        count: "123",
      },
      {
        date: "17/01",
        count: "123",
      },
    ],
  };
  return {
    heartMinutes,
    caloriesBurned,
    step,
  };
}

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
