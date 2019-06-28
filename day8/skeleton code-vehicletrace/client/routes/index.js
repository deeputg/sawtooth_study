var express = require('express');
var router = express.Router();

const {Client} = require("./Client");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboards', { title: 'Dashboards' });
});

router.post('/manufacture',(req,res,next)=>{
  try{
    var data =  req.body;
    var pri_key= req.body.manufactureKey;
    var  clentObj = new Client(pri_key);
    clentObj.sendData('addVehicleAsManufacture',data);
    res.send({message: "Vehicle added successfully"});
  }catch(err){
    console.log(err);
  }
 

});

router.post('/register',(req,res,next)=>{
  try{
    var data =  req.body;
    var pri_key= req.body.registerKey;
    var  clentObj = new Client(pri_key);
    clentObj.sendData('addRegister',data);
    res.send({message: "Vehicle Registration succesful"});
  }catch(err){
    console.log(err);
  }
 

});

module.exports = router;
