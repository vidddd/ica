var express = require('express'),
    http = require('http'),
    app = express(),
    path = require('path'),
    util = require('util'),
    engine = require('ejs-locals'),
    server = http.createServer(app);
const port = process.env.PORT || 3000;
const config = require("./config/config.js");
const aqicn = require("./apis/aqicn.js");

server.listen(port);

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    var data;
       aqicn.getStations(function(response){
         // Here you have access to your variable
         res.render('index', {
              url: config.URL,
              spains: response
          })
        });
});

// Log that the servers running
console.log("Server running on port: " + port);
