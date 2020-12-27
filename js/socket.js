var socket=io();
socket.on("you",function(data){
	window.myname=data;
});

socket.on("othersMsg",function(data){
	//console.log(data.user,data.msg);
	appendOthersMsg(data.user,data.msg);
});

socket.on("redirect",function(data){
	window.location="/";
});

socket.on("status",function(data){
	//console.log(data.on,data.off);
	updateStatus(data.on,data.off);
});

function logout(){
	socket.emit("logout","logout");
}

function updateStatus(online,offline){
	var list = document.getElementById("members-main");
  	while(list.childNodes[2]){
  		list.removeChild(list.childNodes[2]);
  	}
	appendingChild(online,"green","online");
	appendingChild(offline,"red","offline");
}

function appendingChild(users,color,state){
	var list = document.getElementById("members-main");
	for(var i=users.length-1;i>-1;i--){
		if(users[i]==myname){
			continue;
		}
		var member=document.createElement("div");
		member.setAttribute("class","members-in-chat");
		member.innerHTML="<span class='mem-name'>"+users[i]+"</span>"+"<span class='status' style='color:"+color+"'>"+state+"</span>";
		list.appendChild(member);
	}
}

function appendOthersMsg(user,msg){
	var time=getCurrentDate();
	var chat=document.getElementById("chats-part");
	var newChat=document.createElement("div");
	var clear=document.createElement("div");
	newChat.innerHTML="<div class='others-chat-msg'><div class='sender-id'><span>"+user+":</span></div><span>"+msg+"</span></div><span class='time-for-chat'>"+time[0]+"."+time[1]+time[2]+"</span>";
	newChat.setAttribute("class","others-chat");
	clear.setAttribute("class","clear");
	chat.appendChild(newChat);
	chat.appendChild(clear);
	scroll(chat);
}
function typing(event){
	if(event.keyCode==13){
		sbmt();
	}
}
function sbmt(){
	sendBox=document.getElementById("send-box");
	msg=sendBox.value;
	sendBox.value="";
	sendBox.focus();
	socket.emit("msg",msg);
	appendMyMsg(msg);
}
function appendMyMsg(msg){
	var time=getCurrentDate();
	var chat=document.getElementById("chats-part");
	var newChat=document.createElement("div");
	var clear=document.createElement("div");
	newChat.innerHTML="<div><span>"+msg+"</span></div><span class='time-for-chat'>"+time[0]+"."+time[1]+time[2]+"</span></div>";
	newChat.setAttribute("class","my-chat");
	clear.setAttribute("class","clear");
	chat.appendChild(newChat);
	chat.appendChild(clear);
	scroll(chat);
}

function getCurrentDate(){
	var d = new Date();
	var hr = d.getHours();
	var minu = d.getMinutes();
	if (minu < 10) {
    		minu = "0" + minu;
	}
	var ampm = "am";
	if( hr > 12 ) {
    		hr -= 12;
    	ampm = "pm";
	}
	if(hr<10){
		hr="0"+hr;
	}
	
	return [hr,minu,ampm];
}

function scroll(chat){
	var height=chat.scrollHeight;
	chat.scrollTo(0,height);
}
