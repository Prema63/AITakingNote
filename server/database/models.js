import { db, newDB } from "./db.js";

const userTable = `
CREATE TABLE IF NOT EXISTS userTable (
  user_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`

const addNotes = `
CREATE TABLE IF NOT EXISTS notes (
  note_id SERIAL PRIMARY KEY,
  user_id VARCHAR(10) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES usertable(user_id)
    ON DELETE CASCADE
);`



export const createDataBase = (database) => {
    let query = `create database if not exists ${database}`
    newDB.query(query);
    console.log("Table is created....")
}

export const createTable = async () => {
    try {
        await db.query(userTable);
        console.log("User table created");
        
        await db.query(addNotes);
        console.log("Add Notes table created");

    } catch (error) {
        console.log("Error while creating Table", error)
    }
}