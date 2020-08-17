const express = require("express");
const app = express();
const port = 5000;

const { User } = require("./models/User");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/dev");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://youn:youn1210@boiler-plate.hnkur.mongodb.net/<dbname>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! eyaaa~~");
});

app.post("/register", (req, res) => {
  // 회원가입시 필요한 정보를 client에서 가져오면 DB에 넣어준다.
  const user = new User(req.body);
  //여기에서 User.js에 암호화가 들어가고 밑에거 실행
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/login", (req, res) => {
  //요청된 이메일이 DB에 있는지 확인
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "해당하는 유저가 없습니다.",
      });
    }
    //요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      //비밀번호까지 맞으면 토큰을 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //토큰 저장하기 (쿠키 or 로컬스토리지)
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
