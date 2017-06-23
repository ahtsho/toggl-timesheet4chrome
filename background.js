/*
*	Author: Ahadu Tsegaye: 23/06/2017
*/

var toggl_api_uri = "https://www.toggl.com/api/v8/";
var timesheet = Array();
var clients = Array();
var projects = Array();
var workspaces = Array();
var time_entries = Array();


function setAuthorization(request){
	request.setRequestHeader("Authorization","Basic "+ btoa("insert_your_token_here:api_token"))
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

function check(tab_id, data, tab){
	console.log("hello")
	if(tab.url.indexOf('internal1.bridgeconsulting.it/authsec/portal/Bridge/default/BalanceOrderPortletWindow')>-1){
		chrome.pageAction.show(tab_id);
		console.log(chrome.extension.getURL('/data/config.json'));
	} else {
		console.log("not in timesheet page");
	}
}

function loadWorkspaces(){
	xhttpw = new XMLHttpRequest();
	xhttpw.open("GET", toggl_api_uri+"workspaces", true);
	setAuthorization(xhttpw)
	xhttpw.addEventListener("load", processWorkspaces);
	xhttpw.addEventListener("progress", showProgressMsg("get workspaces"));
	xhttpw.addEventListener("error", showErrorMsg);
	xhttpw.addEventListener("abort", showAbortMsg);
	xhttpw.send();
}

function processWorkspaces(){
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

	} else {
		console.log("workspaces request loaded with state: "+xhttpw.readyState+", status: "+xhttpw.status);
	}
}

function loadWorkspaceProjects(w_id){
	xhttpp = new XMLHttpRequest();
	xhttpp.open("GET", toggl_api_uri+"workspaces/"+w_id+"/projects", true);
	setAuthorization(xhttpp)
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
		console.log("project request loaded with state: "+xhttpp.readyState+", status: "+xhttpp.status);
	}
}

function loadWorkspaceClients(w_id){
	xhttpc = new XMLHttpRequest();
	xhttpc.open("GET", toggl_api_uri+"workspaces/"+w_id+"/clients", true);
	setAuthorization(xhttpc)
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
		console.log("project request loaded with state: "+xhttpc.readyState+", status: "+xhttpc.status);
	}
}

function loadTimeEntries() {
	start_date = "2017-06-14T07:00:00+00:00";
	end_date = "2017-06-14T23:59:00+00:00";
	params = "start_date=" + encodeURIComponent(start_date) + "&"+
			 "end_date=" + encodeURIComponent(end_date);
	xhttpt = new XMLHttpRequest();
	xhttpt.open("GET", toggl_api_uri+"time_entries?"+params, true);
	setAuthorization(xhttpt);
	xhttpt.addEventListener("load", processTimeEntries);
	xhttpt.addEventListener("progress", showProgressMsg("time entries", start_date));
	xhttpt.addEventListener("error", showErrorMsg);
	xhttpt.addEventListener("abort", showAbortMsg);
	xhttpt.send();
}

function processTimeEntries() {
	if(xhttpt.readyState === 4 && xhttpt.status === 200){
		//console.log("time entries request successfully loaded");
		var respj = JSON.parse(xhttpt.responseText);
		for(i=0; i < respj.length; i++){
			time_entry = Object();
			time_entry.id = respj[i]["id"];
			time_entry.wid = respj[i]["wid"];
			time_entry.pid = respj[i]["pid"];
			time_entry.duration = respj[i]["duration"];
			time_entry.description = respj[i]["description"];
			time_entry.tags = respj[i]["tags"];
			time_entries.push(time_entry);
		}
		assembleTimeSheet();
	} else {
		console.log("time entries request loaded with state: "+xhttp.readyState+", status: "+xhttp.status);
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

function assembleTimeSheet(){
	/*console.log(workspaces)
	console.log(clients)
	console.log(projects)
	console.log(time_entries)*/
	for (i=0; i < time_entries.length; i++){
		var timesheet_entry = new Object();
		timesheet_entry.date = "14/06/2017"; 
		timesheet_entry.activity = time_entries[i]["tags"];//tags
		timesheet_entry.company = getNameById(clients,time_entries[i]["wid"], "wid");//client
		timesheet_entry.job_order = getNameById(workspaces,time_entries[i]["wid"], "id");//workspace
		timesheet_entry.sub_job_order = getNameById(projects,time_entries[i]["pid"], "id");//project
		timesheet_entry.description = time_entries[i]["description"];//description
		timesheet_entry.number_of_hours = time_entries[i]["duration"];//duration
		timesheet.push(timesheet_entry)	
	}
	console.log(timesheet);
}

chrome.tabs.onUpdated.addListener(loadWorkspaces);