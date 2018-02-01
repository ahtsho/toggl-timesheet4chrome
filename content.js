function setSelectOptionByText(selectid, text){
	var select = document.getElementById(selectid);
	for (var i = 0; i < select.options.length; i++) {
		if (select.options[i].text === text) {
			select.selectedIndex = i;
			break;
		}
	}
	if(select.selectedIndex === 0){
		select.selectedIndex = 49;//"VARIE - DA DESCRIVERE"
	}
}

function setSubJObOrderSelect(text){
	split = text.split("[");
	var optValue = split[1].replace("]",""); 
	var optText = split[0];
	subJobOrders = document.getElementById('subJobOrdersComboBox')
	var option = document.createElement("option");
	option.value = optValue;
	option.text = optText;
	subJobOrders.add(option, 0);
	subJobOrders.selectedIndex = 0;
}

var i = 0;
$(document).ready(function() {
	console.log("timesheet")
	console.log(timesheet);
	if(timesheet){
		console.log("doc ready -> populate form with ts[0]")
		populateFormFileds(timesheet[0]);
	}
});

function submitAjax(){
	$.ajax({
		type: "POST",
		data: serializeForm(),
		url: 'https://apps.bridgeconsulting.it/authsec/portal/Bridge/default/BalanceOrderPortletWindow?action=1&action=insert-timesheet',
		success: function(data, textStatus, xhr) {
			if(xhr.status==200){
				populateFormFileds(timesheet[i]);
			}
		},
		error: function(e) {
			alert("error "+JSON.stringify(e));
		}
	});

}

function serializeForm(){
	var result = { };
	$.each($('#timeSheetCommand').serializeArray(),function() {
		//console.log(this.name+":"+this.value)
		result[this.name] = this.value;
	});
	return result;
}


function populateFormFileds(timesheetRow){
	console.log("[populateFormFileds] i="+i);
	if(i<timesheet.length){
		console.log("submitting data "+JSON.stringify(timesheetRow));
		document.getElementById('date').value=timesheetRow.date;
		setSelectOptionByText('activityComboBox',timesheetRow.activity);
		setSelectOptionByText('companyComboBox',timesheetRow.company);
		setSelectOptionByText('jobOrdersComboBox',timesheetRow.job_order);
		setSubJObOrderSelect(timesheetRow.sub_job_order);
		document.getElementById('description').value=timesheetRow.description;
		document.getElementById('numberOfHour').value=timesheetRow.number_of_hours;
		submitAjax();
		i++;
	} else {
		alert("That's it for today folks!")
		return;
	}
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	// If the received message has the expected format...
	if (msg.text === 'report_back') {
		// Call the specified callback, passing
		// the web-page's DOM content as argument
		//sendResponse(document.all[0].outerHTML);
		sendResponse(document.all[0].innerHTML);
	}
});