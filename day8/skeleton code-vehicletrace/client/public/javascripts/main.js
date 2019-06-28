
function viewData() {
    window.location.href='/listView';

}


function addVehicleAsManufacturer(event) {
    event.preventDefault();
        let manufactureKey = $("#manufactureKey").val();
        let vin = $("#vin").val();
        let engineNo = $("#engineNo").val();
        let makeModel = $("#makeModel").val();
        let dateManufacture = $("#dateManufacture").val();
        alert(manufactureKey+vin+engineNo+makeModel+ dateManufacture);
    
    $.post("/manufacture",{manufactureKey:manufactureKey,vin:vin,engineNo:engineNo,makeModel:makeModel,dateManufacture:dateManufacture},(data, textStatus, jqXHR)=>{
        //return to be handled
        alert("here"+data.message);
        
    },'json');
}

function addVehicleAsRegister() {
        let registerKey = $("#registerKey").val();
        let rvin = $("#rvin").val();
        let ownerName = $("#ownerName").val();
        let ownerAddress = $("#ownerAddress").val();
        let dateRegister = $("#dateRegister").val();
        let manufactureNo = $("#manufactureNo").val();
        let numPlate = $("#numPlate").val();
        //alert(manufactureKey+vin+engineNo+makeModel+ dateManufacture);
    
    $.post("/register",{registerKey:registerKey,vin:rvin,ownerName:ownerName,ownerAddress:ownerAddress,dateRegister:dateRegister,manufactureNo:manufactureNo,numPlate:numPlate},(data, textStatus, jqXHR)=>{
        //return to be handled
        alert("here"+data.message);
    },'json');
}
