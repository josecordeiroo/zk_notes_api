const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost/zk_notes", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));
