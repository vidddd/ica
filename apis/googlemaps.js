var util = require('util'); var GoogleMapsAPI = require('googlemaps');
const config = require("../config/config.js");

function GoogleMaps() {
  if (!(this instanceof GoogleMaps)) { return new GoogleMaps() }
  this.config = config.GOOGLEMAPS_CONFIG;
  this.gmAPI = new GoogleMapsAPI(config.GOOGLEMAPS_CONFIG);

}

module.exports = new GoogleMaps();
