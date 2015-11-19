var Input = require('postcss/lib/input')
var Parser = require('./parser')

module.exports = function (css, opts) {
  var input = new Input(css, opts)
  var parser = new Parser(input)
  parser.tokenize()
  parser.loop()

  return parser.root
}

