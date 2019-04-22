var express = require('express');
var grpcServer = require('../grpc/server');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res) {
  grpcServer.scan(req.body,function (response) {
    if(response.hasOwnProperty("code")){
      res.send({id:req.body.id,scanner:req.body.scanner,status:"TIMEOUT"});
    }else{
      res.send(response);
    }
  });
});
router.get('/', function(req, res) {
  console.log("List of Scanners",grpcServer.getListScanners());
  res.send(grpcServer.getListScanners());
});

module.exports = router;
