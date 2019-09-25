const express = require("express");
const proxy = require("express-http-proxy");
const favicon = require("express-favicon");
const path = require("path");
const port = process.env.PORT || 8000;
const app = express();
app.use(favicon(__dirname + "/build/favicon.ico"));
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "build")));

app.use(
  "/graphql",
  proxy("https://duo2-backend-staging.herokuapp.com", {
    proxyReqPathResolver: function(req) {
      return "/graphql";
    }
  })
);

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use("/", proxy("https://duo2-backend-staging.herokuapp.com"));


app.listen(port);
