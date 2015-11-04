var Parser = require('postcss/lib/parser')
var tokenizer = require('./lib/tokenize')

Parser.prototype.tokenize = function () {
  this.tokens = tokenizer(this.input)
}

module.exports = require('postcss')

