

function login_cookie(event){
    event.preventDefault();
    const Key = document.getElementById('login_id').value;
    if(Key.length === 0){
        alert("please enter the Key");
    }
    else{
        $.post('/',{ privateKey : Key ,privateKey1 : this.data_key },(data, textStatus, jqXHR)=>{
            if(data.done =1){
                sessionStorage.clear();
                sessionStorage.setItem("privatekey",data.privatekey);
                alert(data.message);
                window.location.href='/home';
            }
            else{
                window.location.href='/';
            }
            
        },'json');
    }
}

function uploadFunction(event){
    event.preventDefault();
    var file = event.target.files[0];
    var reader =new FileReader();
    reader.onload=function uploadFunction(event){
        var Key =event.target.result;
        console.log("dataaa="+Key)
        $.post('/',{ privateKey : Key  },(data, textStatus, jqXHR)=>{
            if(data.done =1){
                sessionStorage.clear();
                sessionStorage.setItem("privatekey",data.privatekey);
                alert(data.message);
                window.location.href='/home';
            }
            else{
                window.location.href='/';
            }
            
        },'json');
    };
    reader.readAsText(file);
}

function logout_cookie(event){
    event.preventDefault();
    sessionStorage.clear();
    window.location.href='/';
}

function bake_cookie(event){
    event.preventDefault();
    const p_key=sessionStorage.getItem('privatekey');
    const bake_cookie = document.getElementById('bake_id').value;
    if(bake_cookie.length === 0){
    alert("Please enter a number");

     }
    else{
    $.post('/bake',{pri_key: p_key, cookie: bake_cookie},(data, textStatus, jqXHR)=>{
        alert(data.message);
        }, 'json');
    }
}

function eat_cookie(event){
    event.preventDefault();
    const p_key=sessionStorage.getItem('privatekey');
    const eat_cookie = document.getElementById('eat_id').value;
    console.log("value"+eat_cookie)
    if(eat_cookie.length === 0){
        alert("Please enter the number");
    
    }
    else{
        $.post('/eat',{pri_key : p_key, cookie : eat_cookie},(data,textStatus,jqXHR)=>{
            alert(data.message);
        },'json');
    }

}

function count_cookie(event){
    event.preventDefault();
    const p_key=sessionStorage.getItem('privatekey');
    $.post('/count',{ pri_key: p_key},(data, textStatus, jqXHR)=>{
        alert("Your cookie count is:"  + data.balance);
        document.getElementById("count_id").value ="Your cookies = " + data.balance;
    },'json');
}
