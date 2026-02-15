const express = require("express");
const path = require("path");
const executionRoutes = require("./routes/executionRoutes");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../client/public")));
app.use("/styles", express.static(path.join(__dirname, "../client/styles")));

app.use("/execute", executionRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

const PORT = process.env.PORT || 5234;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Static C Compiler running at http://${HOST}:${PORT}`);
});
