const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  firstName:{
    type: String,
    trim: true,
    required:true,
  } ,
  lastName: {
    type: String,
    trim: true,
    required:true,
  },
  username: {
    type: String,
    trim: true,
    required:[true, 'User name required'],
    unique:true,
  },
  email: {
    type: String,
    trim: true,
    unique:true,
    required:true,
  },
  password: String,
  joined: { type: Date, default: Date.now() },
  bookIssueInfo: [
    {
      book_info: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Issue",
        },
      },
    },
  ],
  gender: String,
  post:{
    type:String,
    default:"user",
  },
  branch:{
    type:String,
    default:" ",
  },
  mobile:Number,
  address: {
    type: String,
    required:true,
  },
  fines: { type: Number, default: 0 },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
