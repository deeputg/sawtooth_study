'use strict'
//require the handler module.
const {TransactionHandler} = require("sawtooth-sdk/processor/handler");
const {TextEncoder,TextDecoder} = require("text-encoding/lib/encoding");
const {InvalidTransaction,InternalError} = require('sawtooth-sdk/processor/exceptions')
const crypto = require('crypto')

const _hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

//require encoder and decoder
const decoder = new TextDecoder('utf8');
const encoder = new TextEncoder('utf8');
//Define Family name
const FAMILY_NAME = 'TRACEVEHICLE';
const FAMILY_VERSION = '1.0';
//Define Namespace 
const NAMESPACE = _hash(FAMILY_NAME).substr(0,6);


//function to obtain the payload obtained from the client



//function to display the errors
var _toInternalError = function (err) {
  //throw internal error message
  console.log("Interenal Error rrrrrrrrrrrrrrrrrrrrrrrrrrrrr"+err);
  
};

//function to set the entries in the block using the "SetState" function
const _setEntry = (context, address, stateValue) => {
  let dataBytes = encoder.encode(stateValue)
  let entries = {
    [address]: dataBytes 
  }
  return context.setState(entries)
}


const removeFromJar = async function(context, address, msg){ 
  let oldmsg = await readFrom(context, address);
    if(oldmsg=='')
    oldmsg=0;
    else
    oldmsg = parseInt(oldmsg);

    msg = parseInt(msg);
    msg = msg - oldmsg;
    console.log("old msg+new***********************************",msg);
    let msgBytes = encoder.encode(msg.toString());
    console.log("msgBytes ***********************************",msgBytes);
  
    let entries = { 
    [address]: msgBytes   
    } 
    return context.setState(entries);  
  } 

  const addVehicleAsManufacture = async function(context, address, msg){ 
    //let oldmsg = await readFrom(context, address);
    //if(oldmsg=='')
    // oldmsg=0;
    // else
    // oldmsg = parseInt(oldmsg);

    // msg = parseInt(msg);
    // msg = msg + oldmsg;
    //console.log("old msg+new***********************************",msg);
    let msgBytes = encoder.encode(JSON.stringify(msg));
    console.log("msgBytes ***********************************",msgBytes);
  
    let entries = { 
    [address]: msgBytes   
    } 
    return context.setState(entries); 
    } 
  

const readFrom = function(context, address){ 
  return context.getState([address]).then(function(stateKeyValueAddress){  
      //var data = 0; 
      let data = stateKeyValueAddress[address]; 
      let newdata = new Buffer(data, 'base64').toString();
      console.log("State Address value decoded ==============================",newdata);

      // if(!newdata)
      // return "";
      console.log("State Address value decoded ============iuiui==================",newdata);
      return newdata;
  });
}

const get_address = function (publicKey,vin){
    //create and return address
    return _hash(FAMILY_NAME).substr(0,6)+_hash(vin).substr(0,6)+_hash(publicKey).substr(0,58);
}



class CookieJarHandler extends TransactionHandler{
  constructor(){
    super(FAMILY_NAME,['1.0'],[NAMESPACE])
  }
   apply(transactionProcessRequest, context){ 
    
    try{
      //TP request variables
      //decode the payload
      var msg = decoder.decode(transactionProcessRequest.payload);
      msg = JSON.parse(msg);

      let header = transactionProcessRequest.header 
        this.publicKey = header.signerPublicKey 
        //this.address = hash(FAMILY_NAME).substr(0, 6)+hash(this.publicKey).substr(0,64); 
        this.address = get_address(this.publicKey,msg.value.vin)

      //Selects the action to be performed
      console.log("msg actionttttttttttttttttttttttt"+msg.action);
      
      if (msg.action === 'addVehicleAsManufacture') {
       //write data to state
        return addVehicleAsManufacture(context, this.address, msg.value); 
      } 
      else if (update.action === 'eat') {
          console.log("Entered in else of addVehicleAsManufacture");
          
        return removeFromJar(context, this.address, msg.value);
      
      } else {
          console.log("Entered on elseseeeeeeeeee");
          
      }
    }
    catch(err){
      _toInternalError(err);
    }
    
  }
}

module.exports = Handler

