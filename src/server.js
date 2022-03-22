import express from "express";
import path, { dirname } from "path";

const app = express();
const __dirname = path.resolve();

console.log("hello");

// setting
app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

// static url
app.use("/public", express.static(__dirname + "/src/public"));

// home.pug 렌더
app.get("/", (req, res) => {
  res.render("home");
});

const handlerListen = () => console.log(`Listening on http://localhost:3000`);

app.listen(3000, handlerListen);
