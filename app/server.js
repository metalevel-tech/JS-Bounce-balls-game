let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// https://expressjs.com/en/starter/static-files.html
app.use('/sound', express.static(path.join(__dirname, 'sound')));
app.use('/', express.static(path.join(__dirname, '')));

app.listen(8001, function () {
    console.log("app listening on port 8001!");
});
