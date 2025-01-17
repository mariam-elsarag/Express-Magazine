import app from "../api/app.js";
import { connectToDb } from "../DB/dbConnection.js";

const port = process.env.PORT || 8000;

app.listen(port, async () => {
  try {
    await connectToDb();
    console.log("server listening on port");
  } catch (err) {
    console.log("error running server");
  }
});
