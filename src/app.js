const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./models/user");
require("./db/mongoose");
const mongoose = require("mongoose");
const dateParser = require("./utils/dateParser");
const shortenId = require("./utils/shortenId");

app.use(cors({ optionSuccessStatus: 200 }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

/* ================ Routes ================ */
app.get("/", (req, res) => {
  // console.log(users);
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/exercise/users", async (req, res) => {
  try {
    const users = await User.find({});
    const parsedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
    }));
    res.json(parsedUsers);
  } catch (e) {
    console.error(e);
    res.status(500).send("There seems to be a problem");
  }
});

app.get("/api/exercise/log", async (req, res) => {
  const userId = req.query.userId;
  const limit = req.query.limit;
  const from = req.query.from;
  const to = req.query.to;
  let isFromTo = false;

  try {
    const user = await User.findById({ _id: userId });
    if (!userId || !user) {
      return res.send("User not found, please provide a valid id");
    }
    const { _id, username, count } = user;

    // handle extra optionals
    let presentedLogs = [];
    if (limit) {
      const limitNum = Number(limit);
      if (limitNum === 0) {
        presentedLogs = user.log;
      } else {
        presentedLogs = user.log.filter((log, i) => i < limitNum);
      }
    } else if (from && to) {
      isFromTo = true;
      const fromDate = new Date(from);
      const toDate = new Date(to);
      presentedLogs = user.log.filter(
        (log) => log.date > fromDate && log.date < toDate
      );
    } else {
      presentedLogs = user.log;
    }

    // modify each date for presentation
    const parsedLog = presentedLogs.map((e) => {
      return {
        description: e.description,
        duration: e.duration,
        date: dateParser(e.date),
      };
    });

    isFromTo
      ? res.json({
          _id,
          username,
          from: dateParser(from),
          to: dateParser(to),
          count,
          log: parsedLog,
        })
      : res.json({
          _id,
          username,
          count,
          log: parsedLog,
        });
  } catch (e) {
    res.json("There seems to be a problem");
  }
});

app.post("/api/exercise/new-user", async (req, res) => {
  try {
    const userAlreadyExists = await User.findOne({
      username: req.body.username,
    });
    if (userAlreadyExists) return res.send("username already taken");
    const userId = new mongoose.Types.ObjectId();

    const user = await User.create({
      _id: shortenId(userId),
      username: req.body.username,
    });
    res.json({
      username: user.username,
      _id: user._id,
    });
  } catch (e) {
    console.error(e);
  }
  // redirect a home
  res.redirect("/");
});

app.post("/api/exercise/add", async (req, res) => {
  const { userId, description, duration } = req.body;
  let { date } = req.body;

  // If user doesn't provide date, is current date
  if (!date) {
    date = new Date().toISOString().substring(0, 10);
  }

  // Build entry to be added to user's log
  const newEntry = {
    description,
    duration,
    date,
  };

  try {
    const user = await User.findById({ _id: userId });

    // Early error finding if no user, or date format is incorrect
    if (!user) {
      return res.status(400).send("unknown _id");
    }
    const dateRegex = /\d{4}-[0-1][1-9]-[0-3]\d/;
    if (!dateRegex.test(date)) {
      return res
        .status(400)
        .send(`Cast to Date failed for value "${date}" at path "date"`);
    }

    // If date is correct, and user exists, then add new exercise to log and save
    user.log = [...user.log, newEntry];
    user.count = user.log.length;
    await user.save();

    // this is to get date in the following format: 'Sun Aug 09 2020';
    const formatedDate = dateParser(user.log[user.log.length - 1].date);

    // This is the imformation exposed to the user
    res.json({
      username: user.username,
      description,
      duration: parseInt(duration),
      _id: userId,
      date: formatedDate,
    });
  } catch (e) {
    res.send({ Error: `${e}` });
  }
});

app.listen(port, () => console.log(`Your app is listening on port ${port}`));
