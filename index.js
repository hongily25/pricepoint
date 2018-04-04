const express = require('express')
const path = require('path')
var request = require('request')
var _ = require('lodash')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.send('hello emily'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
