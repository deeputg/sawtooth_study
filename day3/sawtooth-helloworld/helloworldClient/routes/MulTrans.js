const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')
const {CryptoFactory,createContext} = require('sawtooth-sdk/signing')
const {Secp256k1PrivateKey} =require('sawtooth-sdk/signing/secp256k1')
const {createHash} =require("crypto");
const protobuf = require("sawtooth-sdk/protobuf");
const fetch = require("node-fetch");


FAMILY_NAME='HelloWorld'

privateKey = "66ad89d0ff29b0267fba72ea8d40ef7975e10f8acde8d50d20cdf56ba9599c5e";

function hash(v) {
  return createHash('sha512').update(v).digest('hex');
}

class UserClient{
  constructor(){
//create signer

const context = createContext('secp256k1');
const secp256k1PrivKey = Secp256k1PrivateKey.fromHex(privateKey.trim());
this.signer = new CryptoFactory(context).newSigner(secp256k1PrivKey);


//create address
this.publicKey = this.signer.getPublicKey().asHex();
console.log("Public key [constructor]"+this.publicKey);
this.address = hash("HelloWorld").substr(0,6)+hash(this.publicKey).substr(0,64);

console.log("state address : [constructor ] : "+this.address);

  }



send_data(values){
 try{ 
//create payload

//convert payload into byte format
var payload = '';
payload = values;
const encoder = new TextEncoder('utf8');
var payloadBytes = encoder.encode(payload);
console.log(payloadBytes);
console.log(hash(payloadBytes));


//create transaction header in byte format (use protobuf)
var transactionHeaderBytes = protobuf.TransactionHeader.encode({
  familyName: 'HelloWorld',
  familyVersion: '1.0',
  inputs: [this.address],
  outputs: [this.address],
  signerPublicKey: this.signer.getPublicKey().asHex(),
  nonce: "" + Math.random(),
  batcherPublicKey: this.signer.getPublicKey().asHex(),
  dependencies: [],
  payloadSha512: hash(payloadBytes),
}).finish();


//create transaction(use protobuf)
var transactionBytes = protobuf.Transaction.create({
  header: transactionHeaderBytes,
  headerSignature: this.signer.sign(transactionHeaderBytes),
  payload: payloadBytes,
});
//create batch header in byte format(use protobuf)
const transactions = [transactionBytes]; 
const batchHeaderBytes = protobuf.BatchHeader.encode({ 
signerPublicKey: this.signer.getPublicKey().asHex(), 
transactionIds: transactions.map((txn) => txn.headerSignature), 
}).finish(); 
//create batch (use protobuf)
var batchBytes = protobuf.Batch.create({
  header: batchHeaderBytes,
  headerSignature: this.signer.sign(batchHeaderBytes),
  transactions: transactions
});
//create batchlist (use protobuf)
var batchListBytes = protobuf.BatchList.encode({
  batches: [batchBytes]
}).finish();

  this._send_to_rest_api(batchListBytes);	
}
catch(error) {
  console.error(error);
}	
}


async _send_to_rest_api(batchListBytes){
  if (batchListBytes == null) {
    try{ 
      var geturl = 'http://rest-api:8008/state/'+this.address 
      let response=await fetch(geturl, { 
      method: 'GET', 
      }) 
      let responseJson = await response.json(); 
      var data = responseJson.data; 
      var newdata = new Buffer(data, 'base64').toString(); 
      return newdata; 
      } 
      catch(error) { 
      console.error(error); 
      } 	
  }
  else{
    try{ 
      let resp =await fetch('http://rest-api:8008/batches', { 
      method: 'POST', 
      headers: { 
      'Content-Type': 'application/octet-stream' 
      }, 
      body: batchListBytes 
      }) 
      console.log("response", resp); 
      } 
      catch(error) { 
      console.log("error in fetch", error); 
      } 
 }
}


}module.exports.UserClient = UserClient;