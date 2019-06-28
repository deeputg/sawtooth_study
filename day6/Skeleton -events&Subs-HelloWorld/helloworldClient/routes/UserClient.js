const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')
const {CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1')
const {createHash} = require('crypto')
const protobuf = require('sawtooth-sdk/protobuf')
const fetch = require('node-fetch')

const FAMILY_NAME= 'HelloWorld'
const privateKeyHex = "66ad89d0ff29b0267fba72ea8d40ef7975e10f8acde8d50d20cdf56ba9599c5e";

function hash(v) {
  return createHash('sha512').update(v).digest('hex');
}

class UserClient{
 constructor(){
//create signer
 const context = createContext('secp256k1');
 const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKeyHex.trim());
 this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
 this.publicKey = this.signer.getPublicKey().asHex();
 this.address = hash("HelloWorld").substr(0, 6) + hash(this.publicKey).substr(0, 64);
    
  } 


//create address


send_data(values){
//create payload
try{
var payload = ''
payload = values;
var encode =new TextEncoder('utf8');
const payloadBytes = encode.encode(payload)
const address = this.address;
//convert payload into byte format
var inputadd = [address];
var outputadd = [address];
//create transaction header in byte format (use protobuf)
const transactionHeaderBytes = protobuf.TransactionHeader.encode({
  familyName: 'HelloWorld',
  familyVersion:'1.0',
  inputs:inputadd,
  outputs:outputadd,
  signerPublicKey:this.publicKey ,
  nonce: "" + Math.random(),
  batcherPublicKey:this.publicKey ,
  dependencies: [],
  payloadSha512:hash(payloadBytes)
  }).finish()

//create transaction(use protobuf)
const transaction = protobuf.Transaction.create({
  header:transactionHeaderBytes,
  headerSignature:this.signer.sign(transactionHeaderBytes),
  payload:payloadBytes
});
//create batch header in byte format(use protobuf)
const Transactions = [transaction];
const batchHeaderBytes = protobuf.BatchHeader.encode({
signerPublicKey:this.publicKey,
transactionIds: Transactions.map((txn) => txn.headerSignature)
}).finish();
//create batch (use protobuf)

const batchSignature=this.signer.sign(batchHeaderBytes);
const batch = protobuf.Batch.create({
  header: batchHeaderBytes,
  headerSignature:batchSignature,
  transactions:Transactions
});

//create batchlist (use protobuf)
const batchListBytes=protobuf.BatchList.encode({
  batches:[batch]
}).finish();

this._send_to_rest_api(batchListBytes); 
}catch(error){
  console.log(error)
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
      //console.log(data);
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
      headers: {'Content-Type': 'application/octet-stream'},
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