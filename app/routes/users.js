var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");

const withAuth = require("../middlewares/auth");

require("dotenv").config();
const secret = process.env.JWT_TOKEN;

//Model
const User = require("../models/user");
const Note = require("../models/note");

router.post("/register", async (req, res) => {
  const { name, email, userName, password } = req.body;
  const user = new User({ name, email, password, userName });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error registering new user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: "Incorrect email or password" });
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (!same) {
          res.status(401).json({ error: "Incorrect email or password" });
        } else {
          const token = jwt.sign({ email }, secret, { expiresIn: "1d" });
          res.json({ user: user, token: token });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error, please try again" });
  }
});

router.put("/", withAuth, async (req, res) => {
  const { _id, name, userName, email } = req.body;

  try {
    var user = await User.findOneAndUpdate(
      { _id },
      {$set: { name: name, email: email, userName: userName }},
      {upsert: true, 'new': true}
    );
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Problem to update user" });
  }
});

router.put("/password/:id", withAuth, async (req, res) => {
  const { password } = req.body;

  try {
    var user = await User.findOne({ _id: req.params.id });
    console.log(user)
    user.password = password;
    user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Problem to update user" });
  }
});

router.delete("/delete/:id", withAuth, async (req, res) => {
  try {
    await User.findOneAndRemove({ _id: req.params.id });
    await Note.deleteMany({ author: req.params.id });
    res
      .json({
        success: true,
      })
      .status(204);
  } catch (error) {
    res.status(500).json({ error: "Problem to delete user" });
  }
});

router.get("/", withAuth, async (req, res) => {
  try {
    let user = await User.findById({ _id: req.user._id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Problem to get user" });
  }
});

module.exports = router;
