import { db, newDB } from "./db.js";

const userTable = `
CREATE TABLE IF NOT EXISTS userTable (
  user_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`



export const createDataBase = (database) =>{
    let query = `create database if not exists ${database}`
    newDB.query(query);
    console.log("Table is created....")
}

export const createTable = async() => {
    try {
        await db.query(userTable);
        console.log("User table created");

    } catch (error) {
        console.log("Error while creating Table", error)
    }
}