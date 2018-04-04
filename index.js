const express = require('express')
const path = require('path')
var session = require('express-session')
const ejsLint = require('ejs-lint')
var _ = require('lodash')
var request = require('request')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', function (req, res) {
    res.send('hello')

  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
