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

router.delete("/:id", withAuth, async (req, res) => {
  try {
      await User.findOneAndRemove({ _id: req.params.id });
      await Note.deleteMany({author: req.params.id})
    res
      .json({
        success: true,
      })
      .status(204);
  } catch (error) {
    res.status(500).json({ error: "Problem to delete user" });
  }
});

module.exports = router;
