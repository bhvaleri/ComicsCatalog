var express = require('express');
var $ = require('jquery');
var isbn = require('./isbn');
var app = express();

app.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  req.params && console.log(req.params.isbn);
  debugger;
  next();
});

app.use(express.static(__dirname + '/public'));

app.get('/isbn/:isbn?', function(req, res) {
  console.log('%s %s', req.method, req.url);
  console.log('data: ' + req.query.isbn);
  var url = 'http://www.isbnsearch.org/isbn/' + req.query.isbn; 
  console.log(url);
  $.ajax({
    type: 'GET',
    url: url, 
    success: function (html) {
      console.log('success');
      res.send(isbn.isbnHtml(html));
    },
    error: function(e) {
      console.log(e);
    }
  });
});

var port = 8000;
app.listen(port);
console.log('Listening on port ' + port);
