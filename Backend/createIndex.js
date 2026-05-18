import mongoose from "mongoose";

const createIndexes = async () => {
  const db = mongoose.connection.db;

  await db.collection("users").createIndex({ fullName: "text", email: "text" });
  await db
    .collection("cases")
    .createIndex({ title: "text", description: "text" });
  await db
    .collection("blogs")
    .createIndex({ title: "text", content: "text", tags: "text" });

  console.log("Text indexes created!");
};

const conn = await mongoose
  .connect("mongodb://localhost:27017/LegalMind")
  .then(async () => {
    await createIndexes();
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
