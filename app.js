const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const mongoose = require('mongoose');
const sourceCodeModule = require('./models/data_model');
const keys = require('./config/keys');

users = [];
connections = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
app.use(
    session({
        secret: "secret_KEY",
        saveUninitialized: true,
        resave: true
    })
);

mongoose.connect(keys.cred.mongoClientID, { useNewUrlParser: true },
    () => console.log("atlas db connected")
);

const port = 3001
server.listen(port);
console.log("server running at ", port);

app.get("/", (req, res) => {
    const id = '5e243df41d878d16693da671';
    sourceCodeModule.findOne({ _id: id }).then(foundPost => {
        res.render('index', {
            dbSource: foundPost.codeBody,
            trig: foundPost.trigger
        })
    });

});

io.sockets.on("connection", socket => {

    //Connect
    connections.push(socket);
    console.log("connected: ", connections.length);

    //Disconnect
    socket.on("disconnect", data => {
        connections.splice(connections.indexOf(socket), 1);
        console.log("disconnected! left:  ", connections.length);
    });

    //Send Message
    socket.on('send message', data => {

        const path = '/home/mah-nigga/Projects/RealTime-Edtior/data.txt'
        write_file(path, data)
    });

    //Change trigger
    socket.on('trigger change', data => {

        const id = '5e243df41d878d16693da671';
        sourceCodeModule.updateOne({ _id: id }, { $set: { trigger: data } }, (err, docs) => {

        })

    });

    //Watch cahnges
    sourceCodeModule.watch().
    on('change', data => {

        let codeString = data.updateDescription.updatedFields.codeBody;
        let trigger = data.updateDescription.updatedFields.trigger
        if (codeString == null) {
            io.sockets.emit('trigger change', { trig: trigger })
        }
    });

    //Upload to database
    function upload(codeBody) {
        const updatedSource = new sourceCodeModule({
            codeBody
        });
        updatedSource.save().then((err, post) => {
            console.log('uploaded!');
        });
    }

});

setTimeout(() => {
    const id = '5e243df41d878d16693da671';
    const path = '/home/mah-nigga/Projects/RealTime-Edtior/data.txt'
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        sourceCodeModule.updateOne({ _id: id }, { $set: { codeBody: data } }, (err, docs) => {

        })
    })
}, 2000)

const fs = require('fs')
fs.watchFile('/home/mah-nigga/Projects/RealTime-Edtior/data.txt', { interval: 5000 }, async(curr, prev) => {
    const path = '/home/mah-nigga/Projects/RealTime-Edtior/data.txt'
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        io.sockets.emit('new message', { msg: data });
    })
});

function write_file(path, data) {
    fs.writeFile(path, data, function(err) {
        if (err) throw err;
    });
}