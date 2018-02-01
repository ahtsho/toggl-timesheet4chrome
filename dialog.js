function submitDateAndToken(){
	var newDate = document.getElementById('new_date').value;
	var token = document.getElementById('token').value;
	if(token){
		chrome.runtime.getBackgroundPage(function(bgWindow) {
			bgWindow.manageTokenAndDate(newDate, token);
			window.close();
		});
	} else {
		alert("Please insert a valid Toggl token.");
	}
}

document.getElementById("sumitButton").onclick = function(e) {
	e.preventDefault();
	var newDate = document.getElementById('new_date').value;
	var token = document.getElementById('token').value;
	if(token){
		chrome.runtime.getBackgroundPage(function(bgWindow) {
			bgWindow.manageTokenAndDate(newDate, token);
			window.close();
		});
	} else {
		alert("Please insert a valid Toggl token.");
	}

};


document.forms[0].onsubmit = function(e) {
	e.preventDefault();
	var newDate = document.getElementById('new_date').value;
	var token = document.getElementById('token').value;
	if(token){
		chrome.runtime.getBackgroundPage(function(bgWindow) {
			bgWindow.manageTokenAndDate(newDate, token);
			window.close();
		});
	} else {
		alert("Please insert a valid Toggl token.");
	}

};

chrome.cookies.get({"url": 'http://apps.bridgeconsulting.it', "name": 'tkn'}, function(cookieToken) {
	if(cookieToken) {
		console.log("token found: "+cookieToken.value);
		document.getElementById('token').value = cookieToken.value;
	} else {
		alert("No token found. Please insert your Toggl token");
	}
});