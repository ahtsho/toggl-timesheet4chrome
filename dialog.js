document.forms[0].onsubmit = function(e) {
	e.preventDefault();
	var newDate = document.getElementById('new_date').value;
	var token = document.getElementById('token').value;
	chrome.runtime.getBackgroundPage(function(bgWindow) {
		bgWindow.setUserInput(newDate, token);
		window.close();
	});
};
