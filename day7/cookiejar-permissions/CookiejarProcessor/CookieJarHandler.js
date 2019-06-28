

'use strict'

//require the handler module.
//declaring a constant variable.
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')


const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions')
const crypto = require('crypto')
const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')

const _hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)
var encoder = new TextEncoder('utf8');
var decoder = new TextDecoder('utf8');
const MIN_VALUE = 0
const CJ_FAMILY = 'cookiejar';
const CJ_NAMESPACE = _hash(CJ_FAMILY).substring(0, 6);

//function to obtain the payload obtained from the client
var _decodeRequest =  function _decodeRequest(payload) {
    payload = payload.toString().split(',');
    if (payload.length === 2) {
      var payload_data = {
        action: payload[0],
        quantity: payload[1]
      }
       
    } else {
      throw new InvalidTransaction('Invalid payload serialization');
      
    }
    if (!payload_data.action) {
      throw new InvalidTransaction('Action is required');
    }
    var quantity = payload_data.quantity;
    if (quantity === null || quantity === undefined) {
      throw new InvalidTransaction('Value is required');
    }
    quantity = parseInt(quantity);
    if (typeof quantity !== "number" || quantity <= MIN_VALUE) {
      throw new InvalidTransaction('Value must be an integer ' + 'no less than 1');
    }
return payload_data
}

//function to display the errors
var _toInternalError = function (err) {
  console.log(" in error message block");
  var message = err.message ? err.message : err;
  throw new InternalError(message);
};

//function to set the entries in the block using the "SetState" function
const _setEntry = (context, address, stateValue) => {
  let dataBytes = encoder.encode(stateValue)
  let entries = {
    [address]: dataBytes 
  }
  return context.setState(entries)
}



class CookieJarHandler extends TransactionHandler{
  constructor(){
    super(CJ_FAMILY,['1.0'],[CJ_NAMESPACE])
  }
   apply(transactionProcessRequest, context){ 
    
    try{
      console.log('trasactioProcessRequest=',transactionProcessRequest);
      const payload=transactionProcessRequest.payload;
      let update = _decodeRequest(payload);
      console.log("update= ",update);
      var header = transactionProcessRequest.header;
      var userPublicKey = header.signerPublicKey;
      var Address = CJ_NAMESPACE + _hash(userPublicKey).slice(-64);
      var action = update.action;
      var quantity = update.quantity;
    
      // Select the action to be performed
      if (update.action === 'bake') {

        return context.getState([Address]).then(function(stateKeyValueAddress){
          console.log("State Address value",JSON.stringify(stateKeyValueAddress));
          var previous_data =0;
          previous_data = stateKeyValueAddress[Address];
          if(previous_data == '' || previous_data == null){
            console.log("No previous cookies, creating new cookie jar");
            var newCount = parseInt(update.quantity);
          }
          else{
            var  count = 0;
            count = parseInt(decoder.decode(previous_data));
            var newCount=count + parseInt(update.quantity);
            console.log("new cookiejar count is :"+newCount);
          }
          var strNewCount=newCount.toString();
          return _setEntry(context ,Address , strNewCount);
        });
      } 
      else if (update.action === 'eat') {
        
        return context.getState([Address]).then(function(stateKeyValueAddress){
          console.log("State Address value",JSON.stringify(stateKeyValueAddress));
          var previous_data = 0;
          previous_data = stateKeyValueAddress[Address];
          if(previous_data == '' || previous_data == null){
            throw new InvalidTransaction("No previous cookies, Eat finction not possible");
          }
          else{
            var count = 0;
            count = decoder.decode(previous_data);
            count =parseInt(count);
            if(update.quantity > count){
              throw new InvalidTransaction("Not enough cookies to eat.The number should be lesser or equal to " + count);
            }
            else{
              var newCount= count - parseInt(update.quantity) ;
            }
            
            console.log("new cookiejar count is :"+newCount);
          }
          var strNewCount=newCount.toString();
          return _setEntry(context ,Address , strNewCount);
        });

      
      } else {
        throw new InvalidTransaction('Action must be bake or eat ');
      }
    }
    catch(err){
      _toInternalError(err);
    }
    
  }
}

module.exports = CookieJarHandler

