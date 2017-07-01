document.forms[0].onsubmit = function(e) {
    e.preventDefault(); // Prevent submission
    var newDate = document.getElementById('new_date').value;
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.setDate(newDate);
        window.close();     // Close dialog
    });
};