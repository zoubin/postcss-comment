var postcss = require('..')
var fs = require('fs')

var file = __dirname + '/inline.css'

postcss()
  .process(
    fs.readFileSync(file, 'utf8'),
    { from: file }
  )
  .then(function (result) {
    console.log(result.css)
  })
  .catch(function (err) {
    console.log(err)
  })
