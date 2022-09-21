const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

require("dotenv").config();

const user = process.env.MONGO_DB_USER;
const secret = process.env.MONGO_DB_PASSWORD;

mongoose
  .connect(
    `mongodb+srv://${user}:${secret}@cluster0.bp2eytj.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));
