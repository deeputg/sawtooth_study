const {createHash} = require('crypto')
const {CryptoFactory, createContext } = require('sawtooth-sdk/signing')
const protobuf = require('sawtooth-sdk/protobuf')
const fs = require('fs')
const fetch = require('node-fetch');
const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1')	
const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')

FAMILY_NAME='TRACEVEHICLE';
FAMILY_VERSION = '1.0'

function hash(v) {
    return createHash('sha512').update(v).digest('hex');
  }
  const encoder = new TextEncoder('utf8');
  const decoder = new TextDecoder('utf8');

  class Client{
    constructor(Key){
      try{
        //create signer, public key and get address
        const context = createContext('secp256k1');
        const secp256k1PrrivetKey = Secp256k1PrivateKey.fromHex(Key.trim());
        this.signer = new CryptoFactory(context).newSigner(secp256k1PrrivetKey);
        this.privateKey = Key;
        this.publicKey = this.signer.getPublicKey().asHex();
      }
      catch(err){
        console.log("Error in client constructor _--------------------"+err);
      }
      
    } 

    get_address(publicKey,vin){
        //create and return address
        return hash(FAMILY_NAME).substr(0,6)+hash(vin).substr(0,6)+hash(publicKey).substr(0,58);
     }
     
      async sendData(action,values){
       console.log('senddata')
       //declare and define Payload and inputAddressList, outputAddressList
       let payload = JSON.stringify({action:action,value:values});
       let payloadBytes = encoder.encode(payload);

    //    console.log("valuessssssssssssssssssssss"+typeof(values.vin));
    //    return
       this.address = this.get_address(this.publicKey,values.vin)
       
       const transactionHeaderBytes = protobuf.TransactionHeader.encode({
         familyName:FAMILY_NAME,
         familyVersion:FAMILY_VERSION,
         inputs:[this.address],
         outputs:[this.address],
         dependencies:[],
         signerPublicKey:this.publicKey,
         batcherPublicKey:this.publicKey,
         nonce:Math.random().toString(),
         payloadSha512:hash(payloadBytes)
       }).finish();
       
       const transaction = protobuf.Transaction.create({
         header:transactionHeaderBytes,
         headerSignature:this.signer.sign(transactionHeaderBytes),
         payload:payloadBytes
       })
     
       const transactions = [transaction];
     
       const batchHeaderBytes = protobuf.BatchHeader.encode({
         signerPublicKey:this.publicKey,
         transactionIds: transactions.map((txn) => txn.headerSignature)
       }).finish();
     
       const batch = protobuf.Batch.create({
         header:batchHeaderBytes,
         headerSignature:this.signer.sign(batchHeaderBytes),
         transactions:transactions
       })
     
       const batchListBytes = protobuf.BatchList.encode({
         batches:[batch]
       }).finish();
     
        this._send_to_rest_api(batchListBytes);	
     
     }
     
     
     async _send_to_rest_api(batchListBytes){
     
       console.log("ENtered in send to rest api function +++++++++++++++++++++++++++++++++"+batchListBytes.toString());
             
         if (batchListBytes == null) {
           try{
           var geturl = 'http://rest-api:8008/state/'+this.address
           console.log("Getting from: " + geturl);
            let response =await fetch(geturl, {
             method: 'GET',
           })
           let responseJson =await response.json();
             var data = responseJson.data;
             var amount = new Buffer(data, 'base64').toString();
             return amount;
           }
           catch(error) {
             console.error(error);
           }	
         }
         else{
           console.log("new code");
           try{
             
             //post request here
             let resp = await fetch("http://rest-api:8008/batches",{
               method:"POST",
               headers: { 'Content-Type': 'application/octet-stream'},
               body:batchListBytes
             })
     
             console.log("response", resp);
             }
              catch(error) {
                console.log("error in fetch", error);
              
            } 
        }
     
     }

}module.exports.Client = Client;