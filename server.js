const express = require('express');
const mongo = require('mongodb').MongoClient;
const path = require('path');
const isValid = require('./valid');
const generator = require('./generator')

const mongoLabUrl = process.env.MONGOLAB_URI;

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
// // Home page
app.get('/', (req, res) => {
  console.log('Connected to server');
  res.sendFile(path.join(__dirname, 'public/index.html'));
}); // end Home page

// URL shortening and DB insert function
app.get('/new/:url(*)', (req, res) => {
  mongo.connect(mongoLabUrl, (err, db) => {
    if (err) console.log('Error connecting to DB server: ' + err);
    console.log('Connected to server');

    const params = req.params.url;
    const collection = db.collection('links');

    const insertDoc = (db, callback) => {
      // check if valid and: 1) generate id; 2) export to db; 3) show result
      if (isValid(params)) {
        const shortId = generator();
        const doc = {url: params, short_id: shortId};
        collection.insert(doc, (err, result) => {
          if (err) console.log('Error inserting document into DB: ' + err);
          console.log('Inserted document into the collection');
        });
        const showResult = {url: params, short_url: `https://urlit.herokuapp.com/${shortId}`};
        res.json(showResult);
      } else {
        res.json({error: 'Wrong url format'})
      }
    }; // end of insert function

    // search DB for existing urls, if not found, run insertDoc() and create
    const searchdb = (db, callback) => {
      collection.findOne({url: params}, {url: 0}, (err, doc) => {
        if (doc === null) {
          insertDoc(db, () => db.close());
        } else {
          const showResult = {url: params, short_url: `https://urlit.herokuapp.com/${doc.short_id}`};
          res.json(showResult);
        }
      });
    }; // end of search in DB
    // initiate function
    searchdb(db, () => db.close());
  }); // end connection to mongo
}); // end of app GET


// redirect function
app.get('/:shortid', (req, res) => {
  mongo.connect(mongoLabUrl, (err, db) => {
    if (err) console.log('Error connecting to DB server: ' + err);
    console.log('Connected to DB server');

    const collection = db.collection('links');
    const params = req.params.shortid; // this will be short id

    const findId = (db, callback) => {
      collection.findOne({short_id: params}, {url: 1}, (err, doc) => {
        if (doc === null) {
          res.json({error: 'Invalid short link'});
        } else {
          // redirects to found url in DB
          res.redirect(doc.url);
        }
      });
    };
    // initiate function
    findId(db, () => db.close());
  });
}); // end of app GET

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
