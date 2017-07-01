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

for (var i = 0; i < timesheet.length; i++) {
	document.getElementById('date').value=timesheet[i].date;
	setSelectOptionByText('activityComboBox',timesheet[i].activity);
	setSelectOptionByText('companyComboBox',timesheet[i].company);
	setSelectOptionByText('jobOrdersComboBox',timesheet[i].job_order);
	setSelectOptionByText('subJobOrdersComboBox',timesheet[i].sub_job_order);
	document.getElementById('description').value=timesheet[i].description;
	document.getElementById('numberOfHour').value=timesheet[i].number_of_hours;
	//document.getElementsByClassName('portlet-form-button')[0].click();
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