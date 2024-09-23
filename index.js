import express from "express";
import bodyParser from "body-parser";
import { userDetails } from "./db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);

const port = 3000;
const users = [];
const JWT_SECRET = "DgenX";

app.get("/user/resetdb", (req, res) => {
  userDetails = {};
  res.json({ msg: "DB Cleared" });
});

app.get("/user/details", (req, res) => {
  res.json({ data: userDetails });
});

// *** User Login ***

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  const user = users.find((user) => {
    return user.email === email;
  });
  if (!user) {
    // console.log(user);
    res.json({ error: "Wrong email or password" });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.json({ error: "Wrong email or password" });
    return;
  }

  //jwt token

  const token = jwt.sign({ username: email }, JWT_SECRET, { expiresIn: "1hr" });
  // const verifyToken = jwt.verify(
  //   "eyJhbGciOiJIUzI1nulsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF5dXNoQGdtYWlsLmNvbSIsImlhdCI6MTcyNjY3NTQyNSwiZXhwIjoxNzI2Njc5MDI1fQ.NwlV5a3WX82Zf4VBiFW0UduBRxUR2c3hLBOD-0c20ac",
  //   JWT_SECRET
  // );

  // console.log("ggwhgahsghash", verifyToken);

  // setCookies
  res.cookie("jwt", token, {
    httpOnly: false,
    secure: false,
    maxAge: 3600000,
    path: "/",
    // sameSite: "Lax",
  });

  res.status(201).json({
    success: true,
    data: {
      email: email,
      token: token,
    },
  });
  // console.log(cookies);
  console.log("Cookies set and successful login");
});

// Protected Route

app.post("/user/verifyuser", (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.json({ error: "Access Denied, No token found" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: "User Authorised, Valid Token" });
  } catch (err) {
    res.json({ error: "Invalid token" });
  }
});

app.get("/user/signup", async (req, res) => {
  // https://expressjs.com/en/resources/middleware/body-parser.html
  // PADHO JAAKR AUR MATCH KARO KYA CHANGES KIYE HUMNE ISS CODE ME KI AB YE CHALNE LAGA
  const { firstName, lastName, password, email } = req.body;
  // res.json({ data: { firstName, lastName } });
  const salt = bcrypt.genSaltSync(10);
  const hash = await bcrypt.hash(password, salt);
  const isMatch = await bcrypt.compare("hello", hash);
  users.push({
    firstName,
    lastName,
    password: hash,
    email,
  });
  console.log(users);
  // res.json("User Created");
});

app.get("/user/logout", (req, res) => {
  res.send("Hello World1");
});

app.listen(port, () => {
  console.log(`Server running on PORT ${port}`);
});
