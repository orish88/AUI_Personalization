


/*Personalize the popup*/
var curDom;
var curUrl;
var curProfileJson = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile9(in_page).json";
getPersonalization(curProfileJson);

document.addEventListener('DOMContentLoaded', () => {

	var bt = document.getElementById("bt_personalize_page");
	bt.addEventListener('click', () => {
		curProfileJson = document.getElementById("input_enter_profile_url").value;
		reloadPage(curProfileJson);
	});

	// document.getElementById("bt_personalize_page_test_profile1").addEventListener('click', () => {
	// 	/* make the profiles constants*/
	// 	curProfileJson = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile9(in_page).json";
	// 	reloadPage(curProfileJson);
	// });

	document.getElementById("bt_personalize_page_test_profile2").addEventListener('click', () => {
		curProfileJson = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile10(tooltip).json";
		reloadPage(curProfileJson);
	});


	/*reload the page, then run personalization(currently just run personalization)*/
	function reloadPage(profileJsonUrl) {

		console.log("prof url: " + profileJsonUrl);
		oldPersonalize(profileJsonUrl);
		// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// 	chrome.tabs.update(tabs[0].id, { url: tabs[0].url }, function () {
		// 		// if(isDefined(curDom)){

		// 		// }
		// 		console.log("update callback called");
		// 		personalize(profileJsonUrl);
		// 	});
		// });
	}
	/**
	 * personalize the page
	 * this is how an extention code works
	 * .....
	 * takes the profile as a variable and runs the script  ps1_e.js
	 */
	function oldPersonalize(profileJsonUrl) {
		// getPersonalization(profileJsonUrl);
		chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
			chrome.tabs.executeScript(null, {
				code: 'console.log("bt was pressed-"); var profileJson ="' + profileJsonUrl + '";'
			}, function () {
				chrome.tabs.executeScript(null, { file: "ps1_e.js" });
			});
		});
	}










	function personalize(profileJsonUrl) {
		// getPersonalization(profileJsonUrl);
		chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
			chrome.tabs.executeScript(null, { file: "sendDOM.js" }, function () {
				requestDOM();
			});
		});
	}

	// A function to use as callback
	function doStuffWithDom(domContent) {
		console.log("do stuuf with dom called: "+domContent);

		// curDom = domContent;
		chrome.tabs.executeScript(null, {
			// code: 'console.log("bt was pressed1") ; console.log("curDom:\n",' + curDom + ') ;'  + '"document.replaceChild(' + curDom + ', document.documentElement);'
			code: 'console.log("bt was pressed1") ; console.log("curDom:\n",' + curDom + ') ;'
		}, function () {
			chrome.tabs.executeScript(null, { file: "jquery.js" }, function(){
				chrome.tabs.executeScript(null, {
					code: 'console.log("bt was pressed2-"); var profileJson ="' + curProfileJson + '";'
				}, function () {
					chrome.tabs.executeScript(null, { file: "ps1_e.js" });
				});
			} );
		});
		// console.log('curDOM:\n' + curDom);
	}
	function requestDOM() {
		// When the browser-action button is clicked...
		console.log("request dom called");
		// chrome.browserAction.onClicked.addListener(function (tab) {
		// ...check the URL of the active tab against our pattern and...
		// if (urlRegex.test(tab.url)) {
		// ...if it matches, send a message specifying a callback too

		// if(isDefined(curUrl) && curUrl === tab.url ){


		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { text: 'report_back' }, null, doStuffWithDom);
			console.log("tab url: " + tabs[0].url, " id: " + tabs[0].id);
		});

		// }
		// });

	}
});
/**
 ); * true if variable is defined, if null/empty/undefined-false
 ); * @param {*variable to determine whether defined or not} variable 
 ); */
function isDefined(variable) {
	if (variable != null && variable != undefined && variable != "")
		return true;
	return false;

}



/* 
,
            "button": {
                "name": "button",
                "type": [],
                "inherits": "",
                "shortcut": "",
                "longdesc": "role=button",
                "tooltip": "",
                "text": "",
                "Symbol": {
                    "url": "",
                    "creator": {
                        "name": "",
                        "url": ""
                    },
                    "width": "",
                    "height": "",
                    "margin": "",
                    "padding": ""
                },
                "@aria-hidden": "true",
                "css": [
                    {
                        "propertyName": "background-color",
                        "value": "#7eeaf6"
                    }
                ]
            },
            "main": {
                "name": "main",
                "type": [],
                "inherits": "",
                "shortcut": "",
                "longdesc": "role=button",
                "tooltip": "",
                "text": "",
                "Symbol": {
                    "url": "",
                    "creator": {
                        "name": "",
                        "url": ""
                    },
                    "width": "",
                    "height": "",
                    "margin": "",
                    "padding": ""
                },
                "@aria-hidden": "true",
                "css": [
                    {
                        "propertyName": "background-color",
                        "value": "#f2f597"
                    }
                ]
            },
            "banner": {
                "name": "banner",
                "type": [],
                "inherits": "",
                "shortcut": "",
                "longdesc": "role=button",
                "tooltip": "",
                "text": "",
                "Symbol": {
                    "url": "",
                    "creator": {
                        "name": "",
                        "url": ""
                    },
                    "width": "",
                    "height": "",
                    "margin": "",
                    "padding": ""
                },
                "@aria-hidden": "true",
                "css": [
                    {
                        "propertyName": "background-color",
                        "value": "#00ff00"
                    }
                ]
            },
            "contentinfo": {
                "name": "contentinfo",
                "type": [],
                "inherits": "",
                "shortcut": "",
                "longdesc": "role=button",
                "tooltip": "",
                "text": "",
                "Symbol": {
                    "url": "",
                    "creator": {
                        "name": "",
                        "url": ""
                    },
                    "width": "",
                    "height": "",
                    "margin": "",
                    "padding": ""
                },
                "@aria-hidden": "true",
                "css": [
                    {
                        "propertyName": "background-color",
                        "value": "#ffb0f2"
                    }
                ]
            }
*/