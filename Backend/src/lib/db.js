const mongoose = require("mongoose");

async function handleConnectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongooDB Connected", conn.connection.host);
} catch (error) {
      console.log("MongooDB error", error);

  }
}

module.exports = {handleConnectDB}