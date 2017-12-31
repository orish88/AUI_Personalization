
// getPersonalization('https://rawgit.com/orish88/AUI_Personalization/master/profiles/profile1.json');

console.log("ps1_e called 2");

getPersonalization(profileJson);

//test changes(1)
// download JSON skin in url, and personalise page based on the settings in it  
function getPersonalization(url) {
	console.log("ps1_e called 3");
	// alert("get personalization called");
	// var script = 'document.body.style.backgroundColor="Yellow";';
	// chrome.tabs.executeScript({
	// 	code: script
	//   });
	//load json skin (profile) and run it
	makeCorsRequest(url);
}
// Make the actual CORS request.
function makeCorsRequest(url) {

	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		alert('CORS not supported');
		return;
	}

	// Response handlers.
	xhr.onload = function () {
		var text = xhr.responseText;
		//parse JSON
		var jsonSkin = JSON.parse(text);
		//make global variable

		window.profile = jsonSkin;

		//run settings
		personalizePage(jsonSkin);

	};

	xhr.onerror = function () {
		console.log("looks like the browser doesn't support CORS. Alternatives include using a proxy or JSONP.");
	};

	xhr.send();
}

// Create the XHR object.
function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}

//personalise page based on the settings in the JSON object recieved
function personalizePage(profile) {

	// alert("personalizee page called");

	console.log("personalize page called for profile: " + profile.name);

	if (isDefined(profile.css)) {
		personalizeCSS(profile.css);
	}

	if (isDefined(profile.attributes)) {
		personalizeAttributes(profile.attributes);
	}
	if (isDefined(profile.tagNames)) {
		personalizeTagnames(profile.tagNames);
	}
	if (isDefined(profile.scopes && isDefined(profile.scopes.itemtypes))) {
		personalizeItemScopes(profile.scopes.itemtypes);
	}
	if (isDefined(profile.scopes && isDefined(profile.scopes.autocomplete))) {
		personalizeAutocomplete(profile.scopes.autocomplete);
	}
	if(isDefined(profile.simplification)){
		console.log("simplification level: "+simplificationLevel);
		var simplificationLevel = profile.simplification;
		personalizeSimplification(simplificationLevel); 
	}
}

function personalizeSimplification(simplificationLevel) {
	console.log("simplification level: "+simplificationLevel);
	var simplificationValue = simplicficationFromStirngToInt(simplificationLevel);

	var simplificationElements = document.querySelectorAll('[AUI-simplification]');
	simplificationElements.forEach(element=>{
		if(simplicficationFromStirngToInt( element.getAttribute("AUI-simplification") ) > simplificationValue ){
			console.log("element "+element+ " hidden: ");
			element.hidden = true;
		}
	});
}
function simplicficationFromStirngToInt(simplificationString){
	var simplificationValue = 1;
	switch (simplificationString) {
		case "critical":
			simplificationValue = 1;
			break;
		case "high":
			simplificationValue = 2;
			break;
		case "medium":
			simplificationValue = 3;
			break;
		case "low":
			simplificationValue = 4;
			break;	
	}
	return simplificationString;
}

function personalizeAutocomplete(autocomplete) {
	console.log("personalize Autocomplete called");
	var elementsWithItemtype = document.querySelectorAll('[autocomplete = "on" ]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
			personalizeNamesInsideAutocomplete(element);
	});
}
function personalizeNamesInsideAutocomplete(elementWithAutoComplete) {

	console.log("personalize autocomplete for " + elementWithAutoComplete + " called");

	var elementsWithName = elementWithAutoComplete.querySelectorAll('input[name]:not([autocomplete="off"])');
	var elementsWithNameList = [...elementsWithName];
	console.log("elements with name list size: " + elementsWithNameList.length);
	elementsWithNameList.forEach(element => {
		console.log("personalize autocomplete name element - in loop before call: element: " + element + " ");
		personalizeAutoCompleteNameElement(element);
	});

}

function personalizeAutoCompleteNameElement(elementWithName){
	var nameVal = elementWithName.getAttribute("name");
	console.log("personalize autocomplete element. nameVal: " +nameVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.autocomplete["on"].names[nameVal];

	if (isDefined(changeAttrVal)) {
		console.log("auticomplete name- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(elementWithName, changeAttrVal);
	}
}

//itemtypes
function personalizeItemScopes(itemtypes) {
	console.log("personalize itemScopes called");

	var elementsWithItemtype = document.querySelectorAll('[itemtype]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
		personalizeItempropsInsideType(element);
	});
}

function personalizeItempropsInsideType(elementWithItemtype) {

	var typeVal = elementWithItemtype.getAttribute("itemtype");
	console.log("personalize itemprop inside type( "+typeVal+") " +elementWithItemtype+" called");
	if (isDefined(typeVal)) {
		var elementsWithItemprop = elementWithItemtype.querySelectorAll('[itemprop]');
		var elementsWithItempropList = [...elementsWithItemprop];
		console.log("elements with item propr list size: "+elementsWithItempropList.length);
		elementsWithItempropList.forEach(element => {
			console.log("personalize itemprop element - in loop before call:  val: ("+typeVal+") element: " +element+" ");
			personalizeItempropElement(element, typeVal);
		});
	}
}

function personalizeItempropElement(element, typeVal) {
	var propVal = element.getAttribute("itemprop");
	console.log("personalize itemprop element. typeval: "+typeVal+",proprVal "+propVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.itemtypes[typeVal].itemprops[propVal];

	if (isDefined(changeAttrVal)) {
		console.log("itemprop- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(element, changeAttrVal);
	}
}

function personalizeTagnames(tagnames) {

	console.log("personalize tagnames called: " + tagnames);
	var tagnameList = Object.keys(tagnames);
	tagnameList.forEach(tagname => {
		console.log("tagname key: " + tagname);
		personalizeTagname(tagnames[tagname]);
	});
}

function personalizeTagname(tagname) {
	console.log("personalize tagname called on: " + tagname.name);
	if (isDefined(tagname.name)) {
		var elementsWithTagname = document.getElementsByTagName(tagname.name);
		var elementsWithTagnameList = Array.prototype.slice.call(elementsWithTagname);
		elementsWithTagnameList.forEach(element => {
			applySettingsOnElement(element, tagname)
		});
	}
}
/**
 * apply page css settings
 * @param {*} cssSettings 
 */
function personalizeCSS(cssSettings) {
	//personalize css:
	var cssFile = cssSettings.cssFileLink;
	console.log("css settings css file: " + cssFile);

	if (isDefined(cssFile)) {
		var linkIndex = cssSettings.linkIndex;
		changeCSSFile(cssFile, parseInt(linkIndex));
		console.log("new css: " + document.getElementsByTagName("link").item(linkIndex));
	}
	var cssBodySettings = profile.css.cssSettings;
	if (isDefined(cssBodySettings)) {
		console.log("set body css called on " + cssBodySettings);
		setCSS(document.body, cssBodySettings);
	}

}


//change css file
function changeCSSFile(cssFile, cssLinkIndex) {
	var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);
	var newlink = document.createElement("link");
	newlink.setAttribute("rel", "stylesheet");
	newlink.setAttribute("type", "text/css");
	newlink.setAttribute("href", cssFile);
	document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
}



/**
 * iterate over the attributes in the profile and change the relevant elements in the DOM 
 * according to the value and settings.
 * @param {*} attributes 
 */
function personalizeAttributes(attributes) {
	if (isDefined(attributes)) {
		var attrList = Object.keys(attributes);
		attrList.forEach(attributeName => {
			personalizeAttribute(attributes[attributeName]);
		});
	}
}
/**
 * change settings for all element in the DOM that have certain attribute
 * @param {*} attribute 
 */
function personalizeAttribute(attribute) {
	if ( !isDefined(attribute.global_settings)|| !isDefined(attribute.global_settings.name) ) {
		return;
	}
	console.log("new version personalizeAttribute called on: " + attribute.global_settings.name);

	var attributeName = attribute.global_settings.name;
	//iterate over all elements with field 'attribute.name' in the DOM
	var elementsWithAttr = document.querySelectorAll('[' + attributeName + ']');
	elementsWithAttr.forEach(element => {
		var attrValName = element.getAttribute(attributeName);
		console.log("attr: " + attributeName + "= attrValName: " + attrValName);
		var attrVal = attribute[attrValName];
		personalizeAttributeValue(element, attrVal);

	});
}

function personalizeAttributeValue(element, attrVal) {
	if (!isDefined(attrVal)) {
		console.log("illegal attribute value " + attrVal + " in " + element);
		return;
	}
	applySettingsOnElement(element, attrVal);
}
/**
 * apply settings(inside attrVal) on elements- includes inheritance!
 * @param {*} element 
 * @param {*} attrVal 
 */
function applySettingsOnElement(element, attrVal) {
	if(isDefined(attrVal.type)){
		var isType = false;
		var elementType = element.tagName.toUpperCase();


		//check if relevant type:
		for(var i=0; i < attrVal.type.length; i++){
			var type = attrVal.type[i];
			if(type.startsWith("not")){
				if(type.length < 5 ){
					continue;
				}
				type = type.substring(4);
				if(type.toUpperCase() === elementType){
					console.log("in for: change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
					return;
				}
			}else
			if(type.toUpperCase() === elementType){
				isType = true;
				break;
			}	
		}
		if(!isType){
			console.log("change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
			return;
		}

	}
	if (isDefined(attrVal.inherits)) {
		console.log("inherits called on element: "+element+" with attr val: "+attrVal.name);
		var attributeName = attrVal.inherits.attributeName;
		var attributeValue = attrVal.inherits.attributeValue;
		console.log("inherits: attrname: "+attributeName+" attrVal: "+attributeValue );
		var inheritedAttrVal = window.profile.attributes[attributeName][attributeValue];
		applySettingsOnElement(element, inheritedAttrVal);

	} else {

		var settings = attrVal;
		console.log("apply settings: " + settings + " on: " + element);
		//apply css changes:

		if (isDefined(settings.css)) {
			var styleSettings = settings.css;
			setCSS(element, styleSettings);
		}
		//change text and symbol:
		if (isDefined(settings.Symbol) && isDefined(settings.Symbol.url)) {
			//set width and height
			var height = "30";
			var width = "30";

			// if (isDefined(settings.Symbol.height)){
			// 	// var height = settings.Symbol.height;
			// 	var height = $(element).height();
			// }
			// if (isDefined(settings.Symbol.width)) {
			// 	// var width = settings.Symbol.width;
			// 	var width = $(element).width();
			// }
			var imgToAdd = document.createElement("img");
			
			console.log("Element: "+element+"\nelement height= "+$(element).height()+"\nelement width= "+$(element).width());
			imgToAdd.setAttribute("src", settings.Symbol.url);

			if(isDefined(settings.css_class)){
				var cssClass= settings.css_class;
				imgToAdd.setAttribute("class",cssClass);
				console.log("cssClass: "+cssClass+" added to image in: "+attrVal.name);
				
			}
			
			// imgToAdd.setAttribute("height", height);
			// imgToAdd.setAttribute("width", width);

			// scaleImage(imgToAdd,attrVal.name);
			
			//add icon when text is defined
			if (isDefined(settings.text)) {
				element.text = settings.text;
				imgToAdd.setAttribute("alt", settings.text);
				element.appendChild(imgToAdd);	
				// element.src = settings.Symbol.url;
				// element.innerHTML = "\<img src\=\"" + settings.Symbol.url + "\" style\=\" margin:0em; padding:0em; padding\-top:-0.2em; float:left; \" height\=\"" + height + "\"  width\=\"" + width + "\"  alt\=\"\"\> " + " " + settings.text;
				//add icon when text isn't defined
				// else element.innerHTML = "\<img src\=\"" + settings.Symbol.url + "\" style\=\" margin:0em; padding:0em; padding\-top:-0.2em; float:left; \" height\=\"" + height + "\"  width\=\"" + width + "\"  alt\=\"\"\> " + " ";
			} else if (isDefined(settings.Symbol.replacetext) && settings.Symbol.replacetext === "true") {
				console.log("inside replace text");
				element.text = "";				
				imgToAdd.setAttribute("alt", element.text);
				imgToAdd.alt = element.innerHTML;
				element.appendChild(imgToAdd);
				// element.src= settings.Symbol.url;
				// element.innerHTML = "\<img src\=\"" + settings.Symbol.url + "\" style\=\" margin:0em; padding:0em; padding\-top:-0.2em; float:left; \" height\=\"" + height + "\"  width\=\"" + width + "\"  alt\=\" " + element.innerHTML + "\"\> ";
			} else {
				//no text, no replace text
				imgToAdd.setAttribute("alt", element.text);
				//TODO: Add case of language from right to left like hebrew
				// element.appendChild(imgToAdd);
				element.insertBefore(imgToAdd, element.firstChild);
				// element.src= settings.Symbol.url;
				// element.text = element.innerHTML;
				// element.innerHTML = "\<img src\=\"" + settings.Symbol.url + "\" style\=\" margin:0em; padding:0em; padding\-top:-0.2em; float:left; \" height\=\"" + height + "\"  width\=\"" + width + "\"  alt\=\"\"\> " + " " + element.innerHTML;
			}
		}
		else {
			//change text only
			if (isDefined(settings.text)) {
				element.innerHTML = settings.text;
			}
		}
		//change width to fit text
		// element.style.width = "auto";
		// element.style.paddingRight = "0.5em";
		// element.style.paddingLeft = "0.5em";
		// add/change tooltip
		if (isDefined(settings.tooltip)) {
			element.title = settings.tooltip;
		}
		// add/change shortcut (accesskey)
		if (isDefined(settings.shortcut)) {
			element.accessKey = settings.shortcut;
		}
	}
}


function scaleImage(img,name){
	console.log("scale image called on: "+img);
	$(img).on('load',function(){
		var css;

		console.log("name: "+name+"\nh: "+$(this).height()+"\nw: "+$(this).width()+"\nph: "+$(this).parent().height()+"\npw: "+$(this).parent().width());

		var mHeight = Math.min( $(this).parent().height() , $(this).height() );
		var mWidth =  Math.min( $(this).parent().width() , $(this).width() ); 
		css = {width : mWidth , height: mHeight };
		// var ratio=$(this).width() / $(this).height();
		// var pratio=$(this).parent().width() / $(this).parent().height();
		// if (ratio<pratio) css={width:'auto', height:'100%'};
		// else css={width:'100%', height:'auto'};
		$(this).css(css);
	});
}
/**
 * 
 set elements' CSS according to the settings in the JSON object recieved
 */
function setCSS(element, settings) {
	if (!isDefined(settings)) {
		return;
	}
	settings.forEach(settingPair => {
		if (isDefined(settingPair.propertyName)) {
			var propertyName = settingPair.propertyName;
			if (isDefined(settingPair.value)) {
				var value = settingPair.value;
				element.style[propertyName] = value;
				// $(element).css(propertyName, value);
			}
		}
	});
}


function isDefined(variable) {
	if (variable != null && variable != undefined && variable != "")
		return true;
	return false;

}
