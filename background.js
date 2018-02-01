/*
*	Author: Ahadu Tsegaye: 23/06/2017
*/
var _ENV_ = '';
var api_token = '';
var toggl_api_uri = "https://www.toggl.com/api/v8/";
var timesheetURL = 'apps.bridgeconsulting.it/authsec/portal/Bridge/default/BalanceOrderPortletWindow';
var bridgedomain = 'http://apps.bridgeconsulting.it';
var timesheet = Array();
var clients = Array();
var projects = Array();
var workspaces = Array();
var time_entries = Array();

var timesheetDate = new Date();
var timesheetStartTime = 'T01:00:00+00:00';
var timesheetEndTime = 'T23:59:59+00:00';

function setAuthorization(request, validToken){
	request.setRequestHeader("Authorization","Basic "+ btoa(validToken+":api_token"))
}

function showProgressMsg(requestname, param){
	console.log("requesting "+requestname+" with "+param)
}

function showErrorMsg(e){
	console.log("Error: "+e)
}

function showAbortMsg(e){
	console.log("The operation was interrupted by user: "+e)
}

function testTokenAndStart(tokenToTest, dateToStartWith){
	console.log("testing token");
	xhttpw = new XMLHttpRequest();
	xhttpw.open("GET", toggl_api_uri+"workspaces", true);
	setAuthorization(xhttpw, tokenToTest)
	xhttpw.addEventListener("load", function(){
		if(xhttpw.readyState === 4 && xhttpw.status === 200){
			api_token = tokenToTest;
			saveTokenForAYear(tokenToTest);
			createTimesheet(dateToStartWith);
		} else if (xhttpw.status==403){
			alert("Your token "+tokenToTest+" dosen't seem to be valid. Insert another one please.")
		}
	});
	xhttpw.send();
}

function loadWorkspaces(){
	xhttpw = new XMLHttpRequest();
	xhttpw.open("GET", toggl_api_uri+"workspaces", true);
	setAuthorization(xhttpw, api_token)
	xhttpw.addEventListener("load", processWorkspaces);
	xhttpw.addEventListener("progress", showProgressMsg("get workspaces"));
	xhttpw.addEventListener("error", showErrorMsg);
	xhttpw.addEventListener("abort", showAbortMsg);
	xhttpw.send();
}

function processWorkspaces(){
	console.log(xhttpw.status);
	if(xhttpw.readyState === 4 && xhttpw.status === 200){
	//	console.log("workspaces request successfully loaded");
		var respj = JSON.parse(xhttpw.responseText);
		for(i=0; i < respj.length; i++){
			workspace = Object();
			workspace.id = respj[i]["id"];
			loadWorkspaceProjects(workspace.id);
			loadWorkspaceClients(workspace.id);
			workspace.name = respj[i]["name"];
			workspaces.push(workspace);
		}
		loadTimeEntries();
	} else if (xhttpw.status==403){
		alert("Your token "+api_token+" dosen't seem to be valid. Insert another one please.")
	} else {
		console.log("workspaces request loaded with state: "+xhttpw.readyState+", status: "+xhttpw.status);
	}
}

function loadWorkspaceProjects(w_id){
	xhttpp = new XMLHttpRequest();
	xhttpp.open("GET", toggl_api_uri+"workspaces/"+w_id+"/projects", true);
	setAuthorization(xhttpp, api_token)
	xhttpp.addEventListener("load", processProject);
	xhttpp.addEventListener("progress", showProgressMsg("get projects"));
	xhttpp.addEventListener("error", showErrorMsg);
	xhttpp.addEventListener("abort", showAbortMsg);
	xhttpp.send();
}

function processProject(){
	if(xhttpp.readyState === 4 && xhttpp.status === 200){
		//console.log("project request successfully loaded");
		var respj = JSON.parse(xhttpp.responseText);
		for(i=0; i < respj.length; i++){
			project = Object();
			project.id = respj[i]["id"];
			project.wid = respj[i]["wid"];
			project.cid = respj[i]["cid"];
			project.name = respj[i]["name"];
			projects.push(project);
		}
	} else {
		//console.log("project request loaded with state: "+xhttpp.readyState+", status: "+xhttpp.status);
	}
}


function loadWorkspaceClients(w_id){
	xhttpc = new XMLHttpRequest();
	xhttpc.open("GET", toggl_api_uri+"workspaces/"+w_id+"/clients", true);
	setAuthorization(xhttpc, api_token)
	xhttpc.addEventListener("load", processClients);
	xhttpc.addEventListener("progress", showProgressMsg("get clients"));
	xhttpc.addEventListener("error", showErrorMsg);
	xhttpc.addEventListener("abort", showAbortMsg);
	xhttpc.send();
}

function processClients(){
	if(xhttpc.readyState === 4 && xhttpc.status === 200){
//		console.log("clients request successfully loaded");
		var respj = JSON.parse(xhttpc.responseText);
		for(i=0; i < respj.length; i++){
			client = Object();
			client.id = respj[i]["id"];
			client.wid = respj[i]["wid"];
			client.name = respj[i]["name"];
			clients.push(client);
		}
	} else {
	//	console.log("project request loaded with state: "+xhttpc.readyState+", status: "+xhttpc.status);
	}
}

function loadTimeEntries() {
	start_date = formatDate(timesheetDate,'ymd','-')+timesheetStartTime;//"2017-06-14T07:59:00+00:00";
	end_date = formatDate(timesheetDate,'ymd','-')+timesheetEndTime;//"2017-06-14T23:59:00+00:00";
	params = "start_date=" + encodeURIComponent(start_date) + "&"+
			 "end_date=" + encodeURIComponent(end_date);
	xhttpt = new XMLHttpRequest();
	xhttpt.open("GET", toggl_api_uri+"time_entries?"+params, true);
	setAuthorization(xhttpt, api_token);
	xhttpt.addEventListener("load", processTimeEntries);
	xhttpt.addEventListener("progress", showProgressMsg("time entries", start_date));
	xhttpt.addEventListener("error", showErrorMsg);
	xhttpt.addEventListener("abort", showAbortMsg);
	xhttpt.send();
}


function mergeInterruptedActivitiesAndPush(entry){
	var idx = findEntry(entry);
	if(idx>0){
		console.log("Merging interrupted task "+JSON.stringify(time_entries[i]));
		time_entries[idx]["duration"] += entry["duration"];
	} else {
		time_entries.push(entry);
	}
}

function findEntry(entry){
	for(var i =0; i< time_entries.length; i++){
		if(time_entries[i]["description"]===entry["description"] && 
			time_entries[i]["tags"][0]===entry["tags"][0]){
			return i;
		} 
	}
	return -1;
}

function processTimeEntries() {
	if(xhttpt.readyState === 4 && xhttpt.status === 200){
		//console.log("time entries request successfully loaded");
		var respj = JSON.parse(xhttpt.responseText);
		if(respj.length > 0){
			for(i=0; i < respj.length; i++){
				time_entry = Object();
				time_entry.id = respj[i]["id"];
				time_entry.wid = respj[i]["wid"];
				time_entry.pid = respj[i]["pid"];
				time_entry.duration = respj[i]["duration"];
				time_entry.description = respj[i]["description"];
				time_entry.tags = respj[i]["tags"];
				mergeInterruptedActivitiesAndPush(time_entry);
			}
			assembleTimeSheet();
		} else {
			alert("No timesheet to submit for date: "+timesheetDate);
		}
	} else {
		//console.log("time entries request loaded with state: "+xhttp.readyState+", status: "+xhttp.status);
	}
}

function getClientNameByWid (wid) {
	for (var i = 0; i < clients.length; i++) {
		if (clients[i]["wid"]==wid){
			return clients[i]["name"];
		}
	}
	return null;
}

function getNameById (list, aid, idName) {
	for (var i = 0; i < list.length; i++) {
		if (list[i][idName]==aid){
			return list[i]["name"];
		}
	}
	return null;
}
var currentTab = Object();

function assembleTimeSheet(){
	timesheet = new Array();
	for (i=0; i < time_entries.length; i++){
		var timesheet_entry = new Object();
		timesheet_entry.date = formatDate(timesheetDate,'dmy','/'); 
		if(time_entries[i]["tags"]){
			timesheet_entry.activity = time_entries[i]["tags"][0]
		} else {
			timesheet_entry.activity = "VARIE - DA DESCRIVERE";
		};//tags
		timesheet_entry.company = getNameById(clients,time_entries[i]["wid"], "wid");//client
		timesheet_entry.job_order = getNameById(workspaces,time_entries[i]["wid"], "id");//workspace
		timesheet_entry.sub_job_order = getNameById(projects,time_entries[i]["pid"], "id");//project
		timesheet_entry.description = time_entries[i]["description"];//description
		timesheet_entry.number_of_hours = convertSecondsToSexagesimals(time_entries[i]["duration"]);//duration
		timesheet.push(timesheet_entry)	
	}
	submitTimesheet();
	//chrome.tabs.sendMessage(currentTab.id, {text: 'report_back'}, submitTimesheet);
}

function submitTimesheet(){
	console.log(timesheet);
	chrome.tabs.executeScript(null, {
		code: 'var timesheet = ' + JSON.stringify(timesheet)
	}, function() {
		chrome.tabs.executeScript(null, {file: 'content.js'});
	});
}

function formatDate(adate, order, separator){
	var dd = adate.getDate();
	var mm = adate.getMonth()+1; //January is 0!
	var yyyy = adate.getFullYear();
	if(dd<10){
		dd='0'+dd;
	}
	if(mm<10){
		mm='0'+mm;
	}
	if (order==='dmy'){
		return dd + separator + mm + separator + yyyy;
	} else if (order==='ymd') {
		return yyyy + separator + mm + separator + dd;
	}
}

function convertSecondsToSexagesimals(durationSec){
	var h_mtmp =  (durationSec / 3600).toString().split('.');
	var m = convertToQuarters(parseInt(h_mtmp[1].slice(0,2)));
	if(m===0){
		return h_mtmp[0];
	}
	return h_mtmp[0] + "," + m;
}

function convertToQuarters(minutes){
	var m = -1;
	if(minutes < 25){
		m = 0;
	} else if(minutes < 50){
		m = 25;
	} else if (minutes < 75){
		m = 50;
	} else if (minutes < 100){
		m = 75;
	}
	return m;
}

function manageTokenAndDate(dateInput, tokenInput){
	chrome.cookies.get({"url": bridgedomain, "name": 'tkn'}, function(cookieToken) {
		if(!cookieToken && !tokenInput) {
			alert("No token found. Please reload the page to insert your Toggl token");
		} else if (!cookieToken && tokenInput) {
			console.log("no saved token and new token -> testing new token");
			testTokenAndStart(tokenInput, dateInput);
		} else if (cookieToken && !tokenInput || cookieToken.value === tokenInput){
			console.log("saved token and no new token -> creating timesheet");
			api_token = cookieToken.value;
			createTimesheet(dateInput);
		} else if(cookieToken.value != tokenInput){ //	cookie, input
			console.log("saved token "+cookieToken.value+" != new token "+tokenInput+" -> testing new token");
			testTokenAndStart(tokenInput, dateInput);
		} 
	});
}

function createTimesheet(datestring){
	console.log("createTimesheet for "+datestring);
	if(api_token){
		if(datestring){
			console.log("creating timesheet for date "+datestring);
			formatTimesheetDate(datestring);
			loadWorkspaces();
		} else {
			timesheetDate = new Date();
		}
		loadWorkspaces();
	}
}

function formatTimesheetDate(datestring){
	timesheetDate = new Date(parseInt(datestring.substring(0,4)), 
		parseInt(datestring.substring(5,7))-1,
		parseInt(datestring.substring(8,10)));
}

function saveTokenForAYear(tk){
	console.log("Saving token");
	chrome.cookies.set({ url: bridgedomain, 
		name: "tkn", 
		value: tk, 
		expirationDate: (new Date().getTime()/1000) + 3600 * 24 * 365 
	});
}

function getCookies(domain, name, callback) {
	console.log("getCookies");
	chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
		if(callback) {
			callback(cookie.value);
		}
	});
}
/*
chrome.tabs.onUpdated.addListener(function(){
	chrome.tabs.getSelected(null, function(tab){
		chrome.pageAction.show(tabId);
		if (_ENV_==='dev'){
			timesheetURL = 'file:///Users/at/Developement/auto-timesheet/public/Bridge%20portal.html';
		}
		alert(tab.url);
		if(tab.url === timesheetURL){
			chrome.pageAction.show(tabId);
			//loadWorkspaces();
		}
	});
});
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("on message");
	          chrome.pageAction.show(sender.tab.id);

	if (request.type === 'change_date') {
		chrome.tabs.create({
			url: chrome.extension.getURL('dialog.html'),
			active: false
		}, function(tab) {
			currentTab = tab;
			chrome.windows.create({
				tabId: tab.id,
				type: 'popup',
				focused: true,
				height:300,
				width:350
			});
		});
	}
});

