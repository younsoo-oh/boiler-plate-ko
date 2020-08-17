const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; //암호화 수
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  let user = this; //위에있는 userSchema를 가리킴

  if (user.isModified("password")) {
    //password가 변할때만 사용하도록
    //비밀번호를 암호화 시킴
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plain 1234567와 암호화된 비밀번호를 비교
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;

  //jsonwebtoken을 이용해서 token생성
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  //인자 두개를 합쳐서 token이 만들어짐 -> 나중에 secretToken을 넣으면 user._id가 누구인지 찾는다.
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
