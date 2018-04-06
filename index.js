const express = require('express')
const path = require('path')
var request = require('request')
var _ = require('lodash')
const ejsLint = require('ejs-lint')
const bodyparser=require('body-parser');
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyparser.json())
  .use(bodyparser.urlencoded({extended:true}))
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
        //console.log("Got a GET request for the homepage");
        //console.log('info: ', info.results);
        if (info.results.length < 1) {
            res.render('pages/no-results');
        }
        var spaces = info.results;
        
        function makeCoords(n) {
            return { lat: n.lat, lng: n.lng, info: n.name }
        }
        var locations = _.map(spaces, makeCoords);

        //console.log(locations);
        var names = _.map(spaces, 'name');
        res.render('pages/city', { reports: spaces, coords: locations, titles: names});
      } else {
          res.send('err')
      }
    }
    request(options, callback); 

  })
  .post('/availability', function (req, res) {
    console.log('req.body: ', req.body);

    var passengers, coworklat, coworklng, date, useraddress, userzipcode; 

    if(req.body.Passengers > 0) {
      passengers = req.body.Passengers
    } else passengers = "1";

    if(req.body.coworklat > 0) {
      coworklat = req.body.coworklat
    } else coworklat = "33.9811714";

    if(req.body.coworklng > 0) {
      coworklng = req.body.coworklng
    } else coworklng = "-118.4157892";

    if(req.body.useraddress > 0) {
      useraddress = req.body.useraddress;
    } else useraddress = "1875 Century Park East"

    if(req.body.userzipcode.length > 0) {
      userzipcode = req.body.zipcode;
    } else userzipcode = "90067"

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
                  "Quantity": passengers,
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
                      },
                      "CountryName": {
                      }
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
                      "Latitude": coworklat,
                      "Longitude": coworklng
                  }
              }
          }
      })      
    };

    

    request.post(options, function callback(error, response, body) {

      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        res.send(info);
      } else {
        res.send(error);
      }
    }
    );


  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
