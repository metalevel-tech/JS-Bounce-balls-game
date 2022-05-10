const app = express();
const appPort = 48001;
const appName = 'Bounce balls';

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public/')));;

app.listen(appPort, function () {
    console.log(`${appName} app listening on port ${appPort}!`);
});