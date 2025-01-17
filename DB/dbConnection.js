import mongoose from "mongoose";

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

export const connectToDb = async () => {
  try {
    await mongoose.connect(DB, { dbName: "Magazine" });
    console.log("Connected to database successfully");
  } catch (err) {
    console.log("Faild to connect to database");
  }
};
