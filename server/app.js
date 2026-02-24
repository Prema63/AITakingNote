import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./database/db.js"; 

dotenv.config();
const app = express();

app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(express.json());

app.get("/", (req, res) => {
    res.send(`Server is running on port: ${process.env.PORT}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});