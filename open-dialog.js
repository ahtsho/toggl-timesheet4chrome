if (confirm('Wanna change date?'))
    chrome.runtime.sendMessage({type:'change_date'});
