let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var readline = require("readline");
const uuidv1 = require('uuid/v4');

//Read terminal Lines
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Load the protobuf
var proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("../protos/scanner.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const REMOTE_SERVER = "0.0.0.0:5001";

let username;

//Create gRPC client
let client = new proto.grpc.Scanner(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

//Start the stream between server and client
function startChat() {
    let nodeId = uuidv1();
    let scanner1Id = '68fca0ad-0b2e-48d6-be15-417f41cc18ba';
    let scanner2Id = '68fca0ad-0b2e-48d6-be15-417f41cc18bc';
    let scannerNode = {id:nodeId,scanners:[{id:scanner1Id,name:"Scanner 1 of Node "+nodeId},{id:scanner2Id,name:"Scanner 2 of Node "+nodeId}]};
    client.register(scannerNode, function(err, node) {
        console.log("Register Return",node);
        let channel = client.listenForScan(function(error, request) {});
        channel.on('data', function(request) {
            console.log("Request Arrived:",request);
            //Simulate the time to scan
            sleep(1000, function () {
                channel.write({id:request.id,scanner: request.scanner,status:"OK"});
            })

        });
        channel.write({id:"1",scanner:{id:scanner1Id,name:"Scanner 1 of Node"+nodeId}});
    });
}

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

//Ask user name then start the chat
startChat();