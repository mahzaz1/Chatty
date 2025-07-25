const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.route");
const messageRouter = require("./routes/message.route");
const { handleConnectDB } = require("./lib/db");
const { app, server } = require("./lib/socket");
const { path } = require("path");

dotenv.config();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server Started At", PORT);
  handleConnectDB();
});

// bvRfzieReNw8KEk2
// malikahzaz301
