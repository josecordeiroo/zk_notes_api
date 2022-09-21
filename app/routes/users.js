var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");

const withAuth = require("../middlewares/auth");
const { findById } = require("../models/user");

require("dotenv").config();
const secret = process.env.JWT_TOKEN;

//Model
const User = require("../models/user");

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

router.patch("/:id", withAuth, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
      }
    );
    const newUser = await User.findById(req.params.id);
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Problem to update user" });
  }
});

module.exports = router;
