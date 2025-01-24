var express = require('express');
var router = express.Router();

var request = require('request');

router.post('/', function(req, res, next) {
  console.log('hey')
  var temp = JSON.parse(req.body.data);
  console.log(temp);
  request({
    url: 'http://corus.kaist.edu:8100/childNodes', //URL to hit
    method: 'post',
    //Lets post the following key/values as form
    headers: {
      'content-type': 'application/json'
    },
    json: temp
  }, function (error, response, result) {
    console.log(result);
    res.send(result);
  })
});

router.post('/table', function(req, res, next) {
  var temp = JSON.parse(req.body.data);
  console.log(temp);

  request({
    url: 'http://corus.kaist.edu:8100/protocolSearch', //URL to hit
    method: 'post',
    //Lets post the following key/values as form
    headers: {
      'content-type': 'application/json'
    },
    json: temp
  }, function (error, response, result) {
    console.log(result);
    res.send(result);
  })
});

router.post('/table-rus', function(req, res, next) {
  var temp = JSON.parse(req.body.data);

  console.log(temp);

  request({
    url: 'http://corus.kaist.edu:8100/clinicalStudySearch', //URL to hit
    method: 'post',
    //Lets post the following key/values as form
    headers: {
      'content-type': 'application/json'
    },
    json: temp
  }, function (error, response, result) {
    console.log(result);
    res.send(result);
  })
});

router.post('/object', function(req, res, next) {
  request({
    url: 'http://corus.kaist.edu:8100/factorInfo', //URL to hit
    method: 'post',
    //Lets post the following key/values as form
    headers: {
      'content-type': 'application/json'
    },
    json: {
      "nct_id": req.body.nct_id,
      "factorName": req.body.factorName
    }
  }, function (error, response, result) {
    res.send(result);
  })
});

router.post('/clipsner', function(req, res, next) {
  request({
    url: 'http://corus.kaist.edu:8100/CLIPSNER', //URL to hit
    method: 'post',
    //Lets post the following key/values as form
    headers: {
      'content-type': 'application/json'
    },
    json: {
      "queryString": req.body.queryString
    }
  }, function (error, response, result) {
    res.send(result);
  })
});

module.exports = router;
