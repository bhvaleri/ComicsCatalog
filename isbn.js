var $ = require('jquery');

var isbnHtml = function (html) {
  //

  var children = $(html).find('.bookinfo').children();
  console.log(children);

  var img = $(html).find('.thumbnail').children()[0].src; 

  //
  var titleAndIssue = $(children[0]).text().split('#');
  console.log($(children[0]).text());
  console.log(titleAndIssue);

  var info = {
    title: titleAndIssue[0],
    issue: titleAndIssue[1].split(' ')[0],
    author: $(children[3]).text().substring('author:'.length),
    img: img
  }
  
  return info;
};

exports.isbnHtml = isbnHtml;
