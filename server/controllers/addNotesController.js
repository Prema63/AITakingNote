import { db } from "../database/db.js";
import dotenv from "dotenv";

dotenv.config();

export const AddNotes = async (req, res) => {
  try {
    const { user_id, title, description, type } = req.body;

    const newNote = await db.query(
      `INSERT INTO notes (user_id, title, description, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, title, description, type]
    );

    res.status(201).json({
      message: "Note created successfully",
      data: newNote.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getNotes = async (req, res) => {
  try {
    const { user_id } = req.params;

    const notes = await pool.query(
      `SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    res.status(200).json({
      count: notes.rows.length,
      data: notes.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}