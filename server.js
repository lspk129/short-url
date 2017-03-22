const express = require('express');
const mongo = require('mongodb').MongoClient;
const path = require('path');
const isValid = require('./valid');
const generator = require('./generator')

// url 'mongodb://<dbuser>:<dbpassword>@ds137100.mlab.com:37100/url' is set to enviroment variable
// for not exposing user and password publicaly
const mongoLabUrl = process.env.MONGOLAB_URI;

const app = express();
const PORT = process.env.PORT || 8080;

// static server for file delivery
app.use(express.static(path.join(__dirname, 'public')));

// // Home page
app.get('/', (req, res) => {
  console.log('Connected to server');
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// route for passing users url
app.get('/new/:url(*)', (req, res) => {
  // connect to MongoLab database server
  mongo.connect(mongoLabUrl, (err, db) => {
    if (err) console.log('Error connecting to DB server: ' + err);
    console.log('Connected to server');

    const params = req.params.url;
    const collection = db.collection('links');

    // function for creating short urls
    const createAndInsert = (db, callback) => {
      // first check if url is valid
      if (isValid(params)) {
        // if valid: 1) generate id
        const shortId = generator();
        const doc = {url: params, short_id: shortId};
        // 2) export to users url and short ID to DB in JSON
        collection.insert(doc, (err, result) => {
          if (err) console.log('Error inserting document into DB: ' + err);
          console.log('Inserted document into the collection');
        });
        // 3) generate JSON result and pass to browser
        const showResult = {url: params, short_url: `https://urlit.herokuapp.com/${shortId}`};
        res.json(showResult);
      } else {
        // if url is not valid, throw error
        res.json({error: 'Wrong url format'})
      }
    };

    // main function
    const main = (db, callback) => {
      // first check if users passed URL exists in DB, return result as short_id only
      collection.findOne({url: params}, {url: 0}, (err, doc) => {
        if (doc === null) {
          // if url not found in DB, run createAndInsert() function
          createAndInsert(db, () => db.close());
        } else {
          // if url exists, form JSON response with returned short_id and pass to browser
          const showResult = {url: params, short_url: `https://urlit.herokuapp.com/${doc.short_id}`};
          res.json(showResult);
        }
      });
    };
    // initiate function, pass DB closing callback
    main(db, () => db.close());
  });
});


// route for redirection
app.get('/:shortid', (req, res) => {
  // connect to MongoLab database server
  mongo.connect(mongoLabUrl, (err, db) => {
    if (err) console.log('Error connecting to DB server: ' + err);
    console.log('Connected to DB server');

    const collection = db.collection('links');
    const params = req.params.shortid;

    // check if user passed valid short url
    const findId = (db, callback) => {
      // seach db by short_id, returning only url
      collection.findOne({short_id: params}, {url: 1}, (err, doc) => {
        if (doc === null) {
          // if passed short_id not found in DB throw error
          res.json({error: 'Invalid short link'});
        } else {
          // if user passed valid id, then redirect
          res.redirect(doc.url);
        }
      });
    };
    // initiate function, and pass db closing callback
    findId(db, () => db.close());
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
