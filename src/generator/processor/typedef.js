const Struct = require('./struct');
module.exports = function({syntax, gen}) {
  return Struct({
    syntax: {typedef: syntax},
    gen,
  }).typedef;
}