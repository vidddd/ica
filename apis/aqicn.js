/***
** Clase para interactuar con la api de http://aqicn.org
^*/
const config = require("../config/config.js");
const db = require("../config/database.js");
const request = require("request");
const util    = require('util');
const mysql = require('mysql');
const sleep = require('system-sleep');
var data = {};

function Aqicn() {
  if (!(this instanceof Aqicn)) { return new Aqicn() }
  this.token = config.API_KEY_AQICN;
  this.LATLNG = config.LATLNG;
  this.connection = mysql.createConnection({
      host     : db.host,
      user     : db.user,
      password : db.password,
      database : db.database
    });
  //console.log(db.host);
}

Aqicn.prototype.getMadrid = function(){
   request('https://api.waqi.info/feed/here/?token='+this.token, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.
    });
}


/** Coge las estaciones de españa de la api y las guarda en bbdd con fechayhora */
Aqicn.prototype.setStations = function(){
   var data = {};
   var token = this.token; var connection = this.connection;
   var url = 'https://api.waqi.info/map/bounds/?latlng='+this.LATLNG+'&token='+this.token;

          request(url, function (error, response, body) {
                data = JSON.parse(body);
                if(response.statusCode === 200 && data.status === 'ok')
                {
                  connection.connect(function(err) {
                     if (err) {
                       console.error('error connecting: ' + err.stack);
                       return;
                     }
                    for (var sta in data.data) {
                            /*var station  = {id: null, date: null, uid: data.data[sta].uid, aqi: data.data[sta].aqi, lat: data.data[sta].lat, lon: data.data[sta].lon};
                            var query = connection.query('INSERT INTO stations SET ?', station, function (error, results, fields) {
                                if (error) throw error;

                              });

                          }*/
                        }
                    });


                } else {
                  console.log('statusCode: ', response.statusCode); // Print the response status code if a response was received
                  console.log('errorrrrrrrr: ', error + " " + util.inspect(data) ); // Print the error if one occurred
                }
            });

}

/* De las estaciones que hay en bbdd se va a la api y coge los datos en detalle de cada una y actualiza **/
Aqicn.prototype.setUids = function(){
  var token = this.token; var connection = this.connection;
  var sorter = 'date';
  var sql    = 'SELECT * FROM stations ORDER BY ' + connection.escapeId(sorter);
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
         for(i in results) {
            var url2 = 'https://api.waqi.info/feed/@'+results[i].uid+'/?token='+token;
                   request(url2, function (error, response, body) {
                       var bo = JSON.parse(body);
                        if(response.statusCode === 200 && bo.status === 'ok')
                        {

                        var pm10 = 0, o3 = 0, no2 = 0, so2 =0, t=0, p=0, h=0;
                         if(bo.data.iaqi.pm10) pm10 = bo.data.iaqi.pm10.v;
                         if(bo.data.iaqi.o3) o3 = bo.data.iaqi.o3.v;
                         if(bo.data.iaqi.no2) no2 = bo.data.iaqi.no2.v;
                         if(bo.data.iaqi.so2) so2 = bo.data.iaqi.so2.v;
                         if(bo.data.iaqi.t) t = bo.data.iaqi.t.v;
                         if(bo.data.iaqi.p) p = bo.data.iaqi.p.v;
                         if(bo.data.iaqi.h) h = bo.data.iaqi.h.v;

                      console.log("33333  "+util.inspect(bo.data.iaqi.h)+" 444444");

                        var query= connection.query('UPDATE stations SET date = ?, date_v = ?, date_tz = ?, attr_url = ?, attr_name = ?, city_name = ?, city_url = ?, dominentpol= ?, pm10 = ?, o3 = ?, no2 = ?, so2 = ?, t = ?, p = ?, h = ? WHERE uid = ?', [bo.data.time.s,bo.data.time.v,bo.data.time.tz,bo.data.attributions[0].url, bo.data.attributions[0].name, bo.data.city.name,bo.data.city.url, bo.data.dominentpol, pm10, o3, no2, so2, t, p, h, bo.data.idx], function (error, results, fields) {
                              if (error) throw error;
                                console.log(results);
                            });

                        }  else
                        {
                          console.log('statusCode: ', response.statusCode); // Print the response status code if a response was received
                          console.log('errorrr222222222:', error + bo.data); // Print the error if one occurred
                        }
                    });
              sleep(1000);
          }
    });
}
Aqicn.prototype.getStations = function(callback){
  var connection = this.connection;
  var sorter = 'date'; var results;
  var sql    = 'SELECT * FROM stations ORDER BY ' + connection.escapeId(sorter);
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
      return callback(results);
        /* for(i in results) {
            console.log(results[i]);
          }*/
    });
}

/*
{ idx: 3837,
aqi: 27,
time: { v: 1478786400, s: '2016-11-10 14:00:00', tz: '+01:00' },
city:
 { name: 'Tarbes J. Dupuy',
   url: 'http://aqicn.org/city/france/midipyrenees/tarbes-j.-dupuy/',
   geo: [ '43.230352054732', '0.062463283538818' ] },
attributions:
 [ { name: 'ORAMIP, association agréée pour surveiller la qualité de l\'air en région Midi-Pyrénées (France). Information sur la pollution de l\'air, Toulouse.',
     url: 'http://www.oramip.org/' },
   { name: 'World Air Quality Index Project',
     url: 'http://waqi.info/' } ],
iaqi:
 { pm10: { v: 4 },
   o3: { v: 27 },
   no2: { v: 4 },
   so2: { v: 0 },
   t: { v: 12 },
   p: { v: 1022 },
   h: { v: 90 } },
dominentpol: 'o3' }
*/

module.exports = new Aqicn();
