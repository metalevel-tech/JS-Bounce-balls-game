let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');

let app = express();
const port = 48001;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// https://expressjs.com/en/starter/static-files.html
// app.use('/sound', express.static(path.join(__dirname, 'sound')));
app.use('/', express.static(path.join(__dirname, '')));

app.listen(port, function () {
    console.log(`Bounce balls app listening on port ${port}!`);
});
