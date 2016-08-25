const os = require('os');
const cluster = require('cluster');

if(cluster.isMaster){
    os.cpus().forEach(() => cluster.fork());
    cluster.on('exit', (worker, code, signal) => {
        console.log(`#${worker.id}: died (${signal || code})`);
        cluster.fork();
    });

    return;
}

const id = cluster.worker.id;
console.log(`#${id}: Created`);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/voca', { server: { auto_reconnect: true } });

const db = mongoose.connection;
db.on('open', () => console.log(`#${id}: Connected database ${db.name}`));
db.on('error', err => {
    console.error(err);
    process.exit(1);
});

const express = require('express');
const passport = require('passport');
const vocaPackage = require('./package.json');

const path = require('path');
const logger = require('morgan');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const flash = require('connect-flash');
const connect = require('connect-mongo');
const session = require('express-session');

const app = express();
app.set('view engine', 'pug');
app.set('port', process.env.PORT || '8080');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));

const secret = require('./config/secret');
const store = new (new connect(session))({ mongooseConnection: db });

app.use(session({ secret, store, key: 'voca.sid', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes')(app, passport);
require('./app/passport')();

app.listen(app.get('port'), () => console.log(`#${id}: Listening on port ${app.get('port')}`));
