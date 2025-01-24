var express = require('express');
var router = express.Router();

var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('hey')
  request({
    url: 'http://chrome.kaist.ac.kr:8100/nodeSeqInfo', //URL to hit
    method: 'get',
    dataType : 'json',
  }, function (error, response, result) {
    var temp = JSON.parse(result);

    res.render('index', {
      'data': temp
    });
  })
});

module.exports = router;
