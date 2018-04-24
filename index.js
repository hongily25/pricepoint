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
        return res.render('pages/index', { reports: [] })
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
        var spaces = info.results;

        try {
            var latExists = spaces[0].lat
        } catch(error) {
            return res.render('pages/no-results')
        }

        if (info == null) {
            console.log('info.results.length', info.results);
            return res.render('pages/no-results');
        } 
        if (info.length < 1) {
            console.log('city', req.body.city);
            console.log('info.results.length', info.results);
            return res.render('pages/no-results');
        } 
        
        function makeCoords(n) {
            return { lat: n.lat, lng: n.lng, info: n.name }
        }
        var locations = _.map(spaces, makeCoords);

        //console.log(spaces);
        var names = _.map(spaces, 'name');
        var msgCity = req.query.city;
        return res.render('pages/city', { reports: spaces, firstLat: spaces[0].lat, firstLng: spaces[0].lng, coords: locations, titles: names, msg: msgCity});
      } else {
          return res.send('err')
      }
    }
    request(options, callback); 

  })
  .post('/availability', function (req, res) {
    //console.log('req.body: ', req.body);
    console.log('req.query.city', req.query.city);

    var passengers, coworklat, coworklng, date, useraddress, userzipcode, date; 

    console.log('req.body.date', req.body.date);

    if(req.body.Passengers) {
      passengers = req.body.Passengers
    } else passengers = "1";

    if(req.body.coworklat) {
      coworklat = req.body.coworklat
    } else coworklat = "33.9811714";

    if(req.body.coworklng) {
      coworklng = req.body.coworklng
    } else coworklng = "-118.4157892";

    if(req.body.useraddress) {
      useraddress = req.body.useraddress;
    } else useraddress = "1875 Century Park East"

    if(req.body.userzipcode) {
      userzipcode = req.body.zipcode;
    } else userzipcode = "90067"

    if(req.body.date != null) {
        date = req.body.date;
    } else date = ""

    var startDate = date.split(' ');

    if (startDate.length < 2) {
        startDate[1] = "11:00 PM"
    }

    var coworkingaddress = req.body.address.split(',');
    console.log('coworking address', coworkingaddress);

    var coworkingZipcode = coworkingaddress[2].replace(/\D/g,'');
    console.log('coworkingZipcode: ', coworkingZipcode);

    var coworkingState = coworkingaddress[2].split(' ');
    

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
                      "AddressLine": useraddress.address,
                      "CityName": req.query.city,
                      "PostalCode": useraddress.zipcode,
                      "LocationType": {
                          "Value": "HomeResidence"
                      },
                      "StateProv": {
                        "StateCode": useraddress.StateCode
                      },
                      "CountryName": {
                        "Code": useraddress.CountryName
                      }
                  }
              },
              "Dropoff": {
                  "Address": {
                      "AddressLine": coworkingaddress[0],
                      "CityName": req.body.city,
                      "PostalCode": coworkingZipcode,
                      "LocationType": {
                          "Value": "HomeResidence"
                      },
                      "StateProv": {
                          "StateCode": coworkingState[0]
                      },
                      "CountryName": {
                          "Code": coworkingaddress[3]
                      },
                      "Latitude": coworklat,
                      "Longitude": coworklng
                  }
              }
          }
      })      
    };

    console.log('options.body ', options.body);
    

    request.post(options, function callback(error, response, body) {

        /*
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        
        try {
            var superShuttleExists = info.data.SuperShuttle[0];
        } catch(error) {
            return res.render('pages/no-results')
        }
        
        
        var img = "https:" + info.data.SuperShuttle[0].GroundServices.GroundServices[0].Reference.TPA_Extensions.ImageURL;
        console.log('this is my info. ', img);
        var rideInfo = info.data.SuperShuttle[0].RateQualifiers[0].RateQualifierValue;

        var startDateRideInfo = info.data.SuperShuttle[0].GroundServices.GroundServices[0].Reference.TPA_Extensions.PickupTimes.PickupTimes[0].StartDateTime;

        var startDateRideInfoArray = Array.from(startDateRideInfo);
        startDateRideInfoArray.splice(9, 0, ' at ');

        startDateRideInfoArray.splice(13, 3, '');

        startDateRideInfoArray.splice(16, 0, ' ');
        startDateRideInfo = startDateRideInfoArray.join('');

        var costInfo = info.data.SuperShuttle[0].GroundServices.GroundServices[0].TotalCharge.EstimatedTotalAmount;

        var descInfo = info.data.SuperShuttle[0].GroundServices.GroundServices[0].RateQualifier.Category.Description;

        var descInfoArray = Array.from(descInfo);
        descInfoArray.splice(8, 0, ' ');
        descInfo = descInfoArray.join('');

        var maxPassengers = info.data.SuperShuttle[0].GroundServices.GroundServices[0].Reference.TPA_Extensions.MaxPassengers;

        var serviceLevelCodeInfo = info.data.SuperShuttle[0].GroundServices.GroundServices[0].Service.ServiceLevel.Code;

        var vehicleTypeInfo = info.data.SuperShuttle[0].GroundServices.GroundServices[0].Service.VehicleType.Code;

        img = "https://cdn.supershuttle.com/service/2/20151118RS5072312.jpg";
        rideInfo = "SuperShuttle";
        startDateRideInfo = "April 12 at 11:00 PM";
        costInfo = 100;
        maxPassengers = 7;
        descInfo = "Non-Stop Ride";
        vehicleTypeInfo = "BLUE V";

        
        return res.render('pages/ride-service', {imgURL: img, rideService: rideInfo, startDateRide: startDateRideInfo, cost: costInfo, max: maxPassengers, passengerCount: req.body.Passengers, desc: descInfo, vehicleType: vehicleTypeInfo, city: req.query.city})
      } else {
        return res.send(error);
      } */
      

        var img = "https://cdn.supershuttle.com/service/2/20151118RS5072312.jpg";
        var rideInfo = "SuperShuttle";
        var startDateRideInfo = startDate[0] + " at " + startDate[1];
        var costInfo = 100;
        var maxPassengers = 7;
        var descInfo = "Non-Stop Ride";
        var vehicleTypeInfo = "BLUE V";

      return res.render('pages/ride-service', {imgURL: img, rideService: rideInfo, startDateRide: startDateRideInfo, cost: costInfo, max: maxPassengers, passengerCount: req.body.Passengers, desc: descInfo, vehicleType: vehicleTypeInfo, city: req.query.city})

    });


  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
