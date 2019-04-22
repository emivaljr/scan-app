'use strict';
let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let timeout = require('callback-timeout');
const SERVER_ADDRESS = "0.0.0.0:5001";
let scanners = new Map();
let scannerNodes = new Map();
let scannerCalls = new Map();
let scanCalls = new Map();
class GrpcServer {
    constructor() {
        this.proto = grpc.loadPackageDefinition(
            protoLoader.loadSync("./protos/scanner.proto", {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            })
        );
    }


    //users = [];

// Receive message from client joining
     register(call, callback) {
        console.log("Join Request",call.request);
         scannerNodes.set(call.request.id,call.request);
        let scannerList = call.request.scanners;
         for(let k in scannerList) {
             console.log(k, scannerList[k]);
             scanners.set(scannerList[k].id,{data:scannerList[k],node_id:call.request.id});
         }
        callback(null,call.request);
    }

     listenForScan(call) {
         call.on('data', function(response) {
             console.log("Scan call",response);
             scannerCalls.set(scanners.get(response.scanner.id).node_id,call);
             if(scanCalls.has(response.id)){
                 let callback = scanCalls.get(response.id);
                 callback(response);
                 scanCalls.delete(response.id);
             }
         });
         call.on('end', function() {
             call.end();
         });
    }
    getListScanners(){
        return Array.from(scanners.entries());
    }

// Send message to all connected clients
     scan(request,callback) {
        console.log("Notify",request);
        if(!scanners.has(request.scanner.id)){
            callback({id:request.id,scanner:request.scanner,status:"SCANNER_NOT_FOUND"});
        }else{
            scanCalls.set(request.id,timeout(callback,5000));
            scannerCalls.get(scanners.get(request.scanner.id).node_id).write(request);
        }
    }

// Define server with the methods and start it


 start() {
     this.server = new grpc.Server();
     this.server.addService(this.proto.grpc.Scanner.service, { register: this.register, listenForScan: this.listenForScan });
     this.server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
    this.server.start();
}
//server.start();

}

module.exports = new GrpcServer();