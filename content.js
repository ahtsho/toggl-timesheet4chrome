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
if(timesheet){
	submitTimesheetRow(timesheet[0]);
}

document.getElementById('timeSheetCommand').addEventListener('load', submitTimesheetRow(timesheet[i]));

function submitTimesheetRow(timesheetRow){
	if(i<timesheet.length){
		console.log("submitting data");
		document.getElementById('date').value=timesheetRow.date;
		setSelectOptionByText('activityComboBox',timesheetRow.activity);
		setSelectOptionByText('companyComboBox',timesheetRow.company);
		setSelectOptionByText('jobOrdersComboBox',timesheetRow.job_order);
		setSubJObOrderSelect(timesheetRow.sub_job_order);
		document.getElementById('description').value=timesheetRow.description;
		document.getElementById('numberOfHour').value=timesheetRow.number_of_hours;
		document.getElementsByClassName('portlet-form-button')[0].click();
		i++;
	} else {
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