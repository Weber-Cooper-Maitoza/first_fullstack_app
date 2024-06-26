const express = require("express");
const routes = express.Router();

routes.route("/session_set/:username").get(async function (req, res) {
  // console.log("In /session_set, session is: " + req.session);
  let status = "";
  if (!req.session.username) {
    req.session.username = req.params.username;
  } else {
    status = "Error: Already logged in as " + req.session.username;
  }
  const resultObj = { status: status };
  res.json(resultObj);
})

routes.route("/session_get").get(async function (req, res) {
  // console.log("In /session_get, session is: " + req.session);
  let username = "";
  if (!req.session.username) {
    // FIXME: do something??
  } else {
    username = req.session.username;
  }
  const resultObj = { username: username };
  res.json(resultObj);
})

routes.route("/session_delete").get(async function (req, res) {
  // console.log("In /session_delete, session is: " + req.session);
  req.session.destroy();
  let status = "No session set";
  const resultObj = { status: status };
  res.json(resultObj);
})
module.exports = routes;