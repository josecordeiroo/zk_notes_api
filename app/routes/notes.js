var express = require("express");
var router = express.Router();

const withAuth = require("../middlewares/auth");

//Model
const Note = require("../models/note");

router.post("/", withAuth, async (req, res) => {
  const { title, body } = req.body;
  try {
    let note = new Note({ title: title, body: body, author: req.user._id });
    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Problem to create a new note" });
  }
});

router.get('/search', withAuth, async (req, res) => {
  const {query} = req.query
  try {
    let notes = await Note.find({author: req.user._id})
    .find({$text: {$search: query}}) //this needs index in note model to work
    res.json(notes)
  } catch (error) {
    res.json({error: error}).status(500)
  }
})

router.get("/:id", withAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let note = await Note.findById(id);
    if (isOwner(req.user, note)) res.json(note);
    else res.status(403).json({ error: "Permission denied" });
  } catch (error) {
    res.status(500).json({ error: "Problem to get a note" });
  }
});

router.get("/", withAuth, async (req, res) => {
  try {
    let notes = await Note.find({ author: req.user._id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.patch("/:id", withAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (isOwner(req.user, note)) {
      await Note.updateOne(
        { _id: req.params.id },
        { title: req.body.title, body: req.body.body }
      );
      let newNote = await Note.findById(req.params.id);
      res.json(newNote);
    } else {
      res.status(403).json({ error: "Permission denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Problem to update a new note" });
  }
});

router.delete("/:id", withAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (isOwner(req.user, note))
      await Note.findOneAndRemove({ _id: req.params.id });
    res
      .json({
        success: true,
      })
      .status(204);
  } catch (error) {
    res.status(500).json({ error: "Problem to delete note" });
  }
});

const isOwner = (user, note) => {
  if (JSON.stringify(user._id) == JSON.stringify(note.author._id)) return true;
  else return false;
};

module.exports = router;
