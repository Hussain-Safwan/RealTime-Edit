var mongoose = require('mongoose');

var sourceCode = mongoose.Schema({
    codeBody: {
      type: String
    },
    trigger: {
      type: String
    }
});

var sourceCodeModule = module.exports = mongoose.model('sourceCodeModule', sourceCode);