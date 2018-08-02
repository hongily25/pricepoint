const express = require('express')
const path = require('path')
var request = require('request')
var _ = require('lodash')
const bodyparser=require('body-parser');
const PORT = process.env.PORT || 5000;
var rp = require('request-promise');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyparser.json())
  .use(bodyparser.urlencoded({extended:true}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async function (req, res) {
    var city = 'Chicago';

    if (req.query.city == null) {
        return res.render('pages/index', { reports: [] })
    } else {
        city = req.query.city;
    }

    var options = {
      url: 'https://coworkingmap.org/wp-json/spaces/' + req.query.country + '/' + city,
      headers: {
        'User-Agent': 'request',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvY293b3JraW5nbWFwLm9yZyIsImlhdCI6MTUzMzE3ODMzMSwibmJmIjoxNTMzMTc4MzMxLCJleHAiOjE1MzM3ODMxMzEsImRhdGEiOnsidXNlciI6eyJpZCI6IjI2ODAifX19.XBOqo71M_k7x5itcb28Vv0a4V0hk3ePYsGUsDq6gyZI'
      }
    };

    async function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        //console.log("Got a GET request for the homepage");
        //console.log('info: ', info.results);
        var spaces = info;

        try {
            var latExists = spaces[0].map.lat
        } catch(error) {
            return res.render('pages/no-results')
        }

        if (spaces == null) {
            return res.render('pages/no-results');
        } 
        if (spaces.length < 1) {
            console.log('city', req.body.city);
            return res.render('pages/no-results');
        } 
        
        function makeCoords(n) {
            return { lat: n.map.lat, lng: n.map.lng, info: n.name }
        }
        var locations = _.map(spaces, makeCoords);

        async function makeSpaces(array) {
            
            var coworkOptions = [];
            var arrOfPromises = [];

            for (let i = 0; i < array.length; i++) {
                // Header
                coworkOptions[i] = {
                    url: 'https://coworkingmap.org/wp-json/spaces/' + req.query.country + '/' + req.query.city + '/' + array[i].slug,
                    headers: {
                    'User-Agent': 'request',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvY293b3JraW5nbWFwLm9yZyIsImlhdCI6MTUzMzE3ODMzMSwibmJmIjoxNTMzMTc4MzMxLCJleHAiOjE1MzM3ODMxMzEsImRhdGEiOnsidXNlciI6eyJpZCI6IjI2ODAifX19.XBOqo71M_k7x5itcb28Vv0a4V0hk3ePYsGUsDq6gyZI'
                    },
                    json: true
                };

                arrOfPromises[i] = rp(coworkOptions[i]);
            }

            var someArray = await Promise.all(
                arrOfPromises
            ).then(function coworkCallback(body) {
                var items = body;
                //console.log('body: ', body);
                for (let i = 0; i < items.length; i++) {
                    if (!items[i].site.includes("https")) {
                        items[i].site = "https://" + items[i].site;
                    }
                }
                return items;
            });

            return someArray;
        }

        //console.log(spaces);
        var names = _.map(spaces, 'name');
        var msgCity = req.query.city;

        // Given an array of spaces in a city, return an array of coworking spaces
        let arrayOfSpaces = await makeSpaces(spaces);
        //console.log('arrayOfSpaces: ', arrayOfSpaces);

        return res.render('pages/city', { reports: arrayOfSpaces, firstLat: spaces[0].map.lat, firstLng: spaces[0].map.lng, coords: locations, titles: names, msg: msgCity});
      } else {
          return res.send('Sorry there was an error.')
      }
    }

    await request(options, callback); 

  })
  .post('/availability', function (req, res) {
    //console.log('req.body: ', req.body);
    console.log('req.query.city', req.query.city);

    var date ; 

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

    if(req.body.date != null) {
        date = req.body.date;
    } else date = ""

    /* split date into array of substrings. ie 04/23/18 11:00 PM to 
    ['04/23/18', '11:00', 'PM']
    */
    var startDate = date.split(' ');

    /* If it doesn't have a date, add a default one */
    if (startDate.length < 2) {
        startDate[1] = "11:00";
        startDate[2] = "AM";
    }

    request('https://google.com', function callback(error, response, body) {

      return res.render('pages/ride-service', {city: req.query.city, day: startDate[0], hour: startDate[1], amPm: startDate[2]})

    });
  })
  .get('/thank-you', function (req, res) {
    if(req.body.date != null) {
        let date = req.body.date;
    } else date = "";

    console.log('date: ', date);

    var startDate = date.split(' ');

    /* If it doesn't have a date, add a default one */
    if (startDate.length < 2) {
        startDate[1] = "12:00";
        startDate[2] = "PM.";
    }

      return res.render('pages/ride-service', {city: 'Los Angeles', day: 'August 2', hour: startDate[1], amPm: startDate[2]})
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
