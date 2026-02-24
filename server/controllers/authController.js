import { db } from "../database/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateToken } from "../middleware/token.js";

dotenv.config();

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userExist = await db.query("SELECT * FROM userTable WHERE email=$1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const result = await db.query("SELECT user_id FROM userTable ORDER BY user_id DESC LIMIT 1");
    let user_id = "user01";

    if (result.rows.length > 0) {
      const lastUserId = result.rows[0].user_id; 
      const numericPart = parseInt(lastUserId.replace("user", ""), 10);
      const nextNumeric = numericPart + 1;
      user_id = nextNumeric < 10 ? `user0${nextNumeric}` : `user${nextNumeric}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = await db.query(
      "INSERT INTO userTable (user_id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, created_at",
      [user_id, name, email, hashedPassword]
    );

    const user = insert.rows[0];

    // use token 
    const token = generateToken({ user_id: user.user_id, email: user.email });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await db.query("SELECT * FROM usertable WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // use JWT token
    const token = generateToken({ user_id: user.user_id, email: user.email });

    res.status(200).json({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
