const express = require("express");
 
const accountRoutes = express.Router();
 
const dbo = require("../db/conn");
 
// This helps convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
// Retrieves all user accounts. 
// Also displays their role. 
// Also their checkings and savings amounts. 
// Does not display passwords. 
accountRoutes.route("/account").get(async (req, res) => {
  try {
    let db_connect = dbo.getDb("bank");
    const projection = { _id: 0, password: 0 };
    const result = await db_connect.collection("accounts").find().project(projection).toArray();
    res.json(result);
  } catch(err) {
    throw err;
  }
});

// Displays all information for one particular account associated with an email address. 
// Do not show the password.
accountRoutes.route("/account/:email").get(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    let myquery = { email: req.params.email };
    const options = { projection: { _id: 0, password: 0 }}
    const result = await db_connect.collection("accounts").findOne(myquery, options);
    res.json(result);
  } catch(err) {
    throw err;
  }
});
 
// Accepts a new account profile with a first name, last name, email address, phone number, and password. 
// (We will handle security in the next assignment, for now it will be a plain text password.). 
// The email address will act as the username. 
// Duplicate email accounts are not allowed. 
// Accounts will have roles, but for now the role should be blank. 
// Accounts will have 0 in savings and 0 in checking when the account is created. 
accountRoutes.route("/account/add").post(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    let myobj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      roles: "",
      savings: 0,
      checking: 0
    };
    const check = await db_connect.collection("accounts").findOne({email: req.body.email});
    if (check != null) {
      res.json({check: false});
      return;
    }
    db_connect.collection("accounts").insertOne(myobj);
    res.json({check: true});
  } catch(err) {
    throw err;
  }
});

// Updates an account related to an email address one of the following three roles: customer, manager, administrator.
accountRoutes.route("/update/:email").post(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    let myquery = { email: req.params.email };

    if (!(req.body.roles == "customer" || req.body.roles == "manager" || req.body.roles == "administrator")) {
      res.json("Incorrect role: " + req.body.roles);
      return;
    }

    let newvalues = {
      $set: {
        roles: req.body.roles
      },
    };
    const result = db_connect.collection("accounts").updateOne(myquery, newvalues);
    res.json(result);
  } catch(err) {
    throw err;
  }
});
 
// Checks if a given email address / password pair matches one found in the data store. If so, returns a successful message, otherwise returns a failure message.
accountRoutes.route("/account/check").post(async (req, res) => {
  try {
    let check;
    let db_connect = dbo.getDb("bank");
    let myquery = { 
      email: req.body.email,
      password: req.body.password
    };
    const result = await db_connect.collection("accounts").findOne(myquery);
    if (result != null) {
      check = true;
    } else {
      check = false;
    }
    const checkObj = { check: check };
    res.json(checkObj);
  } catch(err) {
    throw err;
  }
});

// Deposits money into the account related to an email address. 
// The deposit must specify savings or checking. 
// The money is given as an integer in total cents. 
// For example, if a savings account has $3.01 in it and someone deposits $12.57
// , then the account stored 301, this API call accepts 1257, and backend adds 
// the amount and stores 1558 for the savings value.
accountRoutes.route("/account/deposit/:email").post(async (req, res) => {
  try {
    let errorMessage = "";
    let db_connect = dbo.getDb();
    let myquery = { email: req.params.email };
    let newSavings = await db_connect.collection("accounts").findOne(myquery, { projection: { _id: 0, savings: 1 }});
    let newChecking = await db_connect.collection("accounts").findOne(myquery, { projection: { _id: 0, checking: 1 }});

    if (req.body.savings != null) {
      if (!(/^\+?(0|[1-9]\d*)$/.test(req.body.savings))) {
        errorMessage = "ERROR: savings is not a valid number.";
        const checkObj = { check: false, errorMessage: errorMessage };
        res.json(checkObj);
        return;
      }
      newSavings["savings"] += parseInt(req.body.savings);
    }
    if (req.body.checking != null) {
      if (!(/^\+?(0|[1-9]\d*)$/.test(req.body.checking))) {
        errorMessage = "ERROR: checkings is not a valid number.";
        const checkObj = { check: false, errorMessage: errorMessage };
        res.json(checkObj);
        return;
      }
      newChecking["checking"] += parseInt(req.body.checking);
    }

    let newvalues = {
      $set: {
        savings: newSavings["savings"],
        checking: newChecking["checking"]
      },
    };

    await db_connect.collection("accounts").updateOne(myquery, newvalues);
    await db_connect.collection("accounts").findOne(myquery, {projection: {_id: 0, savings: 1, checking: 1}});
    const checkObj = { check: true, errorMessage: errorMessage };
    res.json(checkObj);
  } catch(err) {
    throw err;
  }
});

// Withdraws money from a checking or savings account related to an email address. 
// The withdrawal cannot go below 0. 
// If a request is made to withdraw more money than exists, do not compute anything. 
// If the withdrawal is successful return a successful message. 
// Otherwise return a failure message.
accountRoutes.route("/account/withdraw/:email").post(async (req, res) => {
  try {
    let errorMessage = "";
    let db_connect = dbo.getDb();
    let myquery = { email: req.params.email };
    let newSavings = await db_connect.collection("accounts").findOne(myquery, { projection: { _id: 0, savings: 1 }});
    let newChecking = await db_connect.collection("accounts").findOne(myquery, { projection: { _id: 0, checking: 1 }});

    if (req.body.savings != null) {
      if (!(/^\+?(0|[1-9]\d*)$/.test(req.body.savings))) {
        errorMessage = "ERROR: savings is not a valid number.";
        const checkObj = { check: false, errorMessage: errorMessage };
        res.json(checkObj);
        return;
      }
      if (newSavings["savings"] - parseInt(req.body.savings) < 0) {
        errorMessage = "ERROR: Tried to withdraw more money than available.";
        const checkObj = { check: false, errorMessage: errorMessage };
        res.json(checkObj);
        return;
      }
      newSavings["savings"] -= parseInt(req.body.savings);
    }
    if (req.body.checking != null) {
      if (!(/^\+?(0|[1-9]\d*)$/.test(req.body.checking))) {
        errorMessage = "ERROR: checking is not a valid number.";
        const checkObj = { check: false, errorMessage: errorMessage };
        res.json(checkObj);
        return;
      }
      if (newChecking["checking"] - parseInt(req.body.checking) < 0) {
        errorMessage = "ERROR: Tried to withdraw more money than available.";
        const checkObj = { check: false, errorMessage: errorMessage };
        res.json(checkObj);
        return;
      }
      newChecking["checking"] -= parseInt(req.body.checking);
    }

    let newvalues = {
      $set: {
        savings: newSavings["savings"],
        checking: newChecking["checking"]
      },
    };

    await db_connect.collection("accounts").updateOne(myquery, newvalues);
    await db_connect.collection("accounts").findOne(myquery, {projection: {_id: 0, savings: 1, checking: 1}});
    const checkObj = { check: true, errorMessage: "" };
    res.json(checkObj);
  } catch(err) {
    throw err;
  }
});

// Transfers money from checking/savings to the other checkings/savings within an 
// account associated with an email address. 
// Does not transfer to other user accounts.
// Like before, the transfer cannot exceed funds. 
// If the withdrawal is successful return a successful message. 
// Otherwise return a failure messages.
accountRoutes.route("/account/transfer/:email").post(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    let myquery = { email: req.params.email };
    let newSavings = await db_connect.collection("accounts").findOne(myquery, { projection: { _id: 0, savings: 1 }});
    let newChecking = await db_connect.collection("accounts").findOne(myquery, { projection: { _id: 0, checking: 1 }});

    if (req.body.savings != null && req.body.checking == null) {
      if (!(/^\+?(0|[1-9]\d*)$/.test(req.body.savings) || /^\+?(0|[1-9]\d*)$/.test(req.body.checking))) {
        res.json("ERROR: savings is not a valid number.");
        return;
      }

      if (newSavings["savings"] - parseInt(req.body.savings) < 0) {
        res.json("ERROR: Tried to withdraw more money than available.")
        return;
      }
      newSavings["savings"] -= parseInt(req.body.savings);
      newChecking["checking"] += parseInt(req.body.savings);

    } else if (req.body.savings == null && req.body.checking != null) {
      if (!(/^\+?(0|[1-9]\d*)$/.test(req.body.savings) || /^\+?(0|[1-9]\d*)$/.test(req.body.checking))) {
        res.json("ERROR: savings is not a valid number.");
        return;
      }

      if (newChecking["checking"] - parseInt(req.body.checking) < 0) {
        res.json("ERROR: Tried to withdraw more money than available.")
        return;
      }
      newChecking["checking"] -= parseInt(req.body.checking);
      newSavings["savings"] += parseInt(req.body.checking);

    } else {
      res.json("ERROR: do not know what to transfer.")
      return;
    }

    let newvalues = {
      $set: {
        savings: newSavings["savings"],
        checking: newChecking["checking"]
      },
    };

    await db_connect.collection("accounts").updateOne(myquery, newvalues);
    // res.json("SUCCESS: valid transfer.");
    const result = await db_connect.collection("accounts").findOne(myquery, {projection: {_id: 0, savings: 1, checking: 1}});
    res.json(result);
  } catch(err) {
    throw err;
  }
});
 
module.exports = accountRoutes;