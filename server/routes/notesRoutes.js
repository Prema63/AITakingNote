import express from "express";
import { AddNotes, getNotes } from "../controllers/addNotesController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/add-note", authenticate, AddNotes);

router.get("/get-notes/:user_id", authenticate, getNotes );

export default router;