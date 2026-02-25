import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createDataBase, createTable } from "./database/models.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js"

dotenv.config();
const app = express();

app.use(
    cors({
        origin: true,
        credentials: true
    })
);
// createDataBase(process.env.DATABASE_URL);
await createTable();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);


app.get("/", (req, res) => {
    res.send(`Server is running on port: ${process.env.PORT}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});