const express = require('express')
const path = require('path')
var session = require('express-session');
var request = require('request');
var _ = require('lodash');

const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', function(req, res) {
    var city = 'Lisbon';

    if (req.query.city == null) {
        res.render('index', { reports: [] })
    } else {
        city = req.query.city;
    }

    var options = {
        url: 'https://card4b-masai-masai-coworkingcoffee-stg-v1.p.mashape.com/coworkingspace/api/discovery/getCoWorkingSpaces?City=' + city,
        headers: {
          'User-Agent': 'request',
          'Content-Type': 'application/json',
          'X-Mashape-Key': 'ShedIfdxswmsh7n7BWdKbLix2oxep1oKrryjsnl9MPWgR9vWwa'
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body);
          console.log("Got a GET request for the homepage");
          console.log('info: ', info.results);
          if (info.results.length < 1) {
              res.render('pages/no-results');
          }
          var spaces = info.results;
          function makeCoords(n) {
              return { lat: n.lat, lng: n.lng, info: n.name }
          }
          var locations = _.map(spaces, makeCoords);
          console.log(locations);
          var names = _.map(spaces, 'name');
          res.render('pages/city', { reports: spaces, coords: locations, titles: names});
        } else {
            res.send('err')
        }
      }
       
      request(options, callback);     
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
