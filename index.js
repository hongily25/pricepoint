const express = require('express')
const path = require('path')
var request = require('request')
var _ = require('lodash')
const ejsLint = require('ejs-lint')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', function (req, res) {
    var city = 'Lisbon';

    if (req.query.city == null) {
        res.render('pages/index', { reports: [] })
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
  .post('/availability', function (req, res) {
    var options = {
      url: 'https://sgrdapi.linksrez.net/api/v1/Ground/Availability',
      headers: {
        'Content-Type': 'application/json',
        'Username': 'sandbox',
        'Password': 'sandbox'
      },
      body: JSON.stringify({
          "Passengers": [
              {
                  "Quantity": 2,
                  "Category": {
                      "Value": "Adult"
                  }
              }
          ],
          "Service": {
              "Pickup": {
                  "DateTime": "04/12/2018 11:00 PM",
                  "Address": {
                      "AddressLine": "2543 N. 60th Ave",
                      "CityName": "Phoenix",
                      "PostalCode": "85035",
                      "LocationType": {
                          "Value": "HomeResidence"
                      },
                      "StateProv": {
                          "StateCode": "AZ"
                      },
                      "CountryName": {
                          "Code": "US"
                      },
                      "Latitude": "33.475609",
                      "Longitude": "-112.188570"
                  }
              },
              "Dropoff": {
                  "Address": {
                      "AddressLine": "2543 N. 60th Ave",
                      "CityName": "Phoenix",
                      "PostalCode": "85035",
                      "LocationType": {
                          "Value": "HomeResidence"
                      },
                      "StateProv": {
                          "StateCode": "AZ"
                      },
                      "CountryName": {
                          "Code": "US"
                      },
                      "Latitude": "33.475609",
                      "Longitude": "-112.188570"
                  }
              }
          }
      })      
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        res.send(info);
      } else {
        res.send(error);
      }
    }

    request.post(options, callback);


  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
