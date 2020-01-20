var mongoose = require('mongoose');

var sourceCode = mongoose.Schema({
    codeBody: {
      type: String
    }
});

var sourceCodeModule = module.exports = mongoose.model('sourceCodeModule', sourceCode);