// alert("ps1_pi called");
document.addEventListener('DOMContentLoaded', () => {  
	// alert("dom loaded 3");
	var bt = document.getElementById("bt_personalize_page");
	bt.addEventListener('click' ,()=>{
		// alert("personalize page clicked 2");

		var urlInput= document.getElementById("input_enter_profile_url").value;

		if(urlInput == null || urlInput === "" ){
			alert("please enter a url of json profile, and press again.");
		}


		chrome.tabs.executeScript(null, {
			code: 'var profileJson ="'+urlInput+'";'
		}, function() {
			chrome.tabs.executeScript(null, {file: "ps1_e.js"});
			// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
		});

		
	});
});