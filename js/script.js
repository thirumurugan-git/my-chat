function open_menu(){
	slide=document.getElementById("members");
	slide.style.marginLeft="2.5px";
	close=document.getElementById("img-to-close");
	home=document.getElementById("img-to-home");
	home.style.display="none";
	close.style.display="inline";
}
function close_menu(){
	slide=document.getElementById("members");
	slide.style.marginLeft="-100%";
	close=document.getElementById("img-to-close");
	home=document.getElementById("img-to-home");
	home.style.display="inline";
	close.style.display="none";
}
