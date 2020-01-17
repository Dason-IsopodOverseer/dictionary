// server.js
// where your node.js app starts
// node.js is the software running on glitch.com that allows server side JavaScript

// This is your server code. I really don't know what to do with it, so here it is...

// initialize node.js modules required
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

// start server
init();

async function getData(url) {
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (error) {
    return null;
  }
} //getData

/**
 * Initialize the app.
 *
 */
function init() {
  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  // Logging for each request
  app.use((req, resp, next) => {
    const now = new Date();
    const time = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
    const path = `"${req.method} ${req.path}"`;
    const m = `${req.ip} - ${time} - ${path}`;
    // eslint-disable-next-line no-console
    console.log(m);
    next();
  });
  
  // tells server to access static pages in public folder
  // http://expressjs.com/en/starter/static-files.html
  app.use(express.static("public"));

  // listen for requests :)
  const listener = app.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
  });

  //getData(url);
} //init

