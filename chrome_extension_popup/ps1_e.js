
/**
 * Main personalziaton script. 
 * How to use:
 * 		The profileJson varaible is initialzied on script execution at a press of a popup button(on run_poup.js).
 * 		profileJson is a url to a json file. is it then turned to a JSON format object, profile,
 * 		and used to personalize the DOM.  
 */
console.log("ps1_e called 4");

/*global counter variable for generating ids for newly created elements*/
var gCtr  =0;

/**
 * profileJson is defined in script execution on run_popup.js
 * */
if ( isDefined(profileJson) ) {
	getPersonalization(profileJson);
}

/** 
*calls functions for  download JSON skin in url, and personalise page based on the settings in it 
**/ 
function getPersonalization(url) {
	if(!isDefined(url)){
		return;
	}
	consoleLog("ps1_e called: ");
	//load json skin (profile) and run it
	// readLocalJson();
	makeCorsRequest(url);
}

/**
 * This is where the actual json file download happens and parsing of the json.
 * It then calls personalizePage on the profile json object(called jsonSkin).
 * @param {*} url 
 */
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
		consoleLog("looks like the browser doesn't support CORS. Alternatives include using a proxy or JSONP.");
	};
	xhr.send();
}

/**
 * Helper function for dowloading the json profile. 
 * Creates the CORS request to be used for the download.
 * This function is called inside makeCorsRequest(url).
 * @param {*} method 
 * @param {*json url} url 
 */
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

// function readLocalJson(){
// 	console.log("readlocaljson profile6- ");
// 	$.getJSON("test_profile6.json", function(json) {
// 		console.log("profile6:\n"+json); // this will show the info it in firebug console
// 	});
// }

/**
 * personalise page based on the settings in the JSON object recieved.
 * This function calls a set of sub-functions, each iterating on 
 * different parts of the profile object, and makes changes in the DOM.
 */
function personalizePage(profile) {
	/*editPopup() = read the popup changes from the profile and apply them*/
	editPopup(profile);
	consoleLog("personalize page called for profile: " + profile.global_settings.name);
	/*AddTooltipClasses() = add classes that are relevant to tooltip changes
	(todo: make dynamic and from profile)*/
	addTooltipCssClasses();
	if ( isDefined(profile.css)) {

	/*personalizeCss() = read the global css changes from the profile and apply them */
		personalizeCSS(profile.css);
	}
	if ( isDefined(profile.tagNames)) {
	/*personalizeTagnames() = read the tagnames(like 'a' or 'p' or 'img') changes from the profile and apply them to relevant elements*/
		personalizeTagnames(profile.tagNames);
	}
	if ( isDefined(profile.attributes)) {
		/*personalizeAttributes() = read the attributes (like aui-destination = "home" ) from the profile
		 and apply them to relevant elements*/
		personalizeAttributes(profile.attributes);
	}

	
  	/* personalizeAllScopedElements() = iterate over the scopes section of the profile and run funcitons 
  	* to personalize the scoped elements.*/
	if(isDefined(profile.scopes)){
		personalizeAllScopedElements(profile.scopes);
	}
	// if ( isDefined(profile.scopes) && isDefined(profile.scopes.itemtypes) ) {
	// 	/*personalizeItemScopes() = read the scoped changes only itemtypes from the profile and apply them to relevant elements (itemtype/prop).
	// 	Scopes mean nested changes, relevant attribute inside some other attribute's scope
	// 	todo: make generic*/
	// 	personalizeItemScopes(profile.scopes.itemtypes);
	// }
	// if ( isDefined(profile.scopes) && isDefined(profile.scopes.autocomplete) ) {
	// 	/*personalizeAutocomplete() = read the scope changes from the profile for auto complete and apply them to relevant elements (like autocomplete).
	// 	Scopes mean nested changes, relevant attribute inside some other attribute's scope*/
	// 	personalizeAutocomplete(profile.scopes.autocomplete);
	// }
	if( isDefined(profile.simplification)){
		consoleLog("simplification level: "+simplificationLevel);
		var simplificationLevel = profile.simplification;
		/*personalizeSimplification() = read the simplification level from the profile and hide relevant elements*/
		personalizeSimplification(simplificationLevel); 
	}
	if(isDefined(profile["aui-distraction"])){
		consoleLog("aui-distraction: "+profile["aui-distraction"]);
		/* personalizeDistraction() = check for elemts that are considered as distractions 
		by the profile and treat them accordingly*/
		personalizeDistraction();
	}
}

/**
 * Read the popup changes from the profile, under "athena-icon", and apply them
 * @param {*} profile 
 */
function editPopup(profile){
	consoleLog("athena icon: edit popup called"  ) ;

	/*get the athena-icon object, inside it are relevant value-objects */
	var athenaIcon = profile["athena-icon"];
	if(!isDefined(athenaIcon)){
		return;
	}
	consoleLog("athena icon is defined: "+athenaIcon) ;

	/*iterate over the elements in the document that have "athena-icon" attribute, 
	look for the relevant value-object(for example, "on tooltip") in athenaIcon and apply the changes:
	the image inside the value-object "someval" will be inserted in the button that has athena-icon ="someval" */
	$("[athena-icon]").each(function(index){
		$( "#"+$(this).attr("id")+" img").remove();
		var iconSettings = athenaIcon[$(this).attr("athena-icon")];
		consoleLog("athena icon = "+$(this).attr("athena-icon") +" url in profile is:: "+iconSettings.Symbol.url ) ;
		applySettingsOnElement($(this),iconSettings);		
	});
}
/**
 * read the simplification level("critical"/"high"/"medium"/"low") from the profile and hide elements with lower simplification.
 * There are four levels of simplification: 
 * critical- show only elements with aui-simplification = "critical".
 * high- critical- show only elements with aui-simplification = "critical" and "high.
 * medium- critical- show only elements with aui-simplification = "critical","high and "medium".
 * low- critical- show only elements with aui-simplification = "critical", "high, "medium" or "low".
 * NOTE: UNMARKED ELEMENTS(i.e elements that have no aui-simplification specified) DO APPEAR!
 * @param {*} simplificationLevel 
 */
function personalizeSimplification(simplificationLevel) {
	consoleLog("simplification level: "+simplificationLevel);
	/*convert the profile's simplification level to its corresponding int value*/
	var simplificationValue = simplicficationFromStringToInt(simplificationLevel);
	//query for all the elements in the DOM with aui-simplification attribute
	var simplificationElements = document.querySelectorAll('[AUI-simplification]');
	simplificationElements.forEach(element=>{
		/*convert the element's simplification level to its corresponding int value 
		and compare with the profile's simplification level*/
		if(simplicficationFromStringToInt( element.getAttribute("AUI-simplification") ) > simplificationValue ){
			consoleLog("element "+element+ " hidden: ");
			/*hide the element:*/
			element.hidden = true;
			$(element).attr("aria-hidden","true");
		}
	});
}
/**
 * convert simplification level from string to int
 * @param {*} simplificationString 
 */
function simplicficationFromStringToInt(simplificationString){
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


/**
 * SCOPE elements functions:
 * scope elements are special elements we want to change in case of
 * combination of 2 nested elements with certain attributes and atribute values. 
 * i.e, if we have autocomplete= "on" and name="somename" inside its scope,
 * we would like to make some changes(apply object-value changes from the profile).
 * Same goes for 'itemtype' with 'itemprop' inside its scope.
 * 
 */


 /**
  * this function iterates over the scopes section of the profile and runs funcitons 
  to personalize the scoped elements.
  */
 function personalizeAllScopedElements(scopes){
	/*Iterate over the scopes in the profile(the attribute 'parents') and look for elements with them */
	consoleLog("Personalize all scopes called");
	scopeKeys = Object.keys(scopes);
	scopeKeys.forEach(scopeItem=>{
		personalizeSingleScopedElement(scopeItem,scopes[scopeItem]);
	});
 }


 /**
  * 
  * @param {*the parent attribute is the attribute that in its scope we should search the 'child attribute'} parentAttr 
  * @param {*the settings of the this scope attribute} singleScopeItem 
  */
 function personalizeSingleScopedElement(parentAttr,singleScopeItem){
	consoleLog("Personalize signle scopes called: "+parentAttr);
	var queryStr = "";
	(Object.keys(singleScopeItem)).forEach(parentValue=>{
		(Object.keys(singleScopeItem[parentValue])).forEach(childAttr=>{
			(Object.keys(singleScopeItem[parentValue][childAttr])).forEach(childValue=>{

				$('['+parentAttr+'="'+parentValue+'"]').find('['+childAttr+'="'+childValue+'"]').each(function() {
					consoleLog("apply called for: "+'['+parentAttr+'="'+parentValue+'"]'+'.find(['+childAttr+'="'+childValue+'"])\n'+
				'with objectValue: '+singleScopeItem[parentValue][childAttr][childValue].name+
				'\nWith element: '+this );
					// $(this).text("inside scope change");

					applySettingsOnElement($(this), singleScopeItem[parentValue][childAttr][childValue]);
				  });
			});
		});
	});
	
 }

/**
 * check for elements with attribute 'autcomplete' and inside their scope check for elements
 * with relevant 'name' values and apply changes.
 * todo: make generic(for scope changes)
 * @param {*} autocomplete 
 */
function personalizeAutocomplete(autocomplete) {
	consoleLog("personalize Autocomplete called");
	/*query for all elements in the dom with 'autocomplete'*/
	var elementsWithItemtype = document.querySelectorAll('[autocomplete = "on" ]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	/*iterate over the queried elemts and check their scopes for 'name' values */
	elementsWithItemtypeList.forEach(element => {
			/*change name values */
			personalizeNamesInsideAutocomplete(element);
	});
}
/**
 * is used inside personalizeAutocomplete().
 * gets elemets with autocomplete = "on" attr, and scans its scope for input elementts with relevant name values
 * (relevant- has an object-value in the profile.)  
 * @param {*} elementWithAutoComplete 
 */
function personalizeNamesInsideAutocomplete(elementWithAutoComplete) {
	consoleLog("personalize autocomplete for " + elementWithAutoComplete + " called");
	var elementsWithName = elementWithAutoComplete.querySelectorAll('input[name]:not([autocomplete="off"])');
	var elementsWithNameList = [...elementsWithName];
	consoleLog("elements with name list size: " + elementsWithNameList.length);
	elementsWithNameList.forEach(element => {
		consoleLog("personalize autocomplete name element - in loop before call: element: " + element + " ");
		personalizeAutoCompleteNameElement(element);
	});

}

/**
 * is used inside personalizeNamesInsideAutocomplete()
 * get an element with attr 'name' (inside autocomplete scope), checks if there's an object-value
 * for this 'name' value,and if so,  applies the changes.
 * 
 * @param {*} elementWithName 
 */
function personalizeAutoCompleteNameElement(elementWithName){
	var nameVal = elementWithName.getAttribute("name");
	consoleLog("personalize autocomplete element. nameVal: " +nameVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	if(isDefined(window.profile.scopes) && isDefined(window.profile.scopes.autocomplete) &&  isDefined(window.profile.scopes.autocomplete["on"] ) ){
		var changeAttrVal = window.profile.scopes.autocomplete["on"].names[nameVal];
	}
	if (isDefined(changeAttrVal)) {
		consoleLog("auticomplete name- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(elementWithName, changeAttrVal);
	}
}

/**
 * check for elements with attribute 'itemtype' and inside their scope check for elements
 * with relevant 'itemprop' values and apply changes.
 * todo: make generic(for scope changes)
 * @param {*} itemtypes 
 */
function personalizeItemScopes(itemtypes) {
	consoleLog("personalize itemScopes called");

	var elementsWithItemtype = document.querySelectorAll('[itemtype]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
		personalizeItempropsInsideType(element);
	});
}
/**
 * is used inside personalizeItemscopes().
 * gets elemets with itemtype  attr, and scans its scope for input elementts with relevant name values
 * (relevant- has an object-value in the profile under the itemtype)  
 * @param {*} elementWithItemtype 
 */
function personalizeItempropsInsideType(elementWithItemtype) {

	var typeVal = elementWithItemtype.getAttribute("itemtype");
	consoleLog("personalize itemprop inside type( "+typeVal+") " +elementWithItemtype+" called");
	if (isDefined(typeVal)) {
		var elementsWithItemprop = elementWithItemtype.querySelectorAll('[itemprop]');
		var elementsWithItempropList = [...elementsWithItemprop];
		consoleLog("elements with item propr list size: "+elementsWithItempropList.length);
		elementsWithItempropList.forEach(element => {
			consoleLog("personalize itemprop element - in loop before call:  val: ("+typeVal+") element: " +element+" ");
			personalizeItempropElement(element, typeVal);
		});
	}
}

/**
* is used inside personalizeNItempropsInsideType
 * get an element with attr 'itemprop' (inside autocomplete scope), checks if there's an object-value
 * for this 'name' value,and if so,  applies the changes.
 * @param {} element 
 * @param {*} typeVal 
 */
function personalizeItempropElement(element, typeVal) {
	var propVal = element.getAttribute("itemprop");
	consoleLog("personalize itemprop element. typeval: "+typeVal+",proprVal "+propVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.itemtypes[typeVal].itemprops[propVal];
	if (isDefined(changeAttrVal)) {
		consoleLog("itemprop- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(element, changeAttrVal);
	}
}
/**
 * iterate over the tagnames in the profile, and check for elements thatare of that element, 
 * and change them usiiing the object-value from the proifle
 * @param {*} tagnames 
 */
function personalizeTagnames(tagnames) {
	consoleLog("personalize tagnames called: " + tagnames);
	var tagnameList = Object.keys(tagnames);
	tagnameList.forEach(tagname => {
		consoleLog("tagname key: " + tagname);
		personalizeTagname(tagnames[tagname]);
	});
}
/**
 * used inside personalizeTagnames().
 * personalize specific tagname- a
 * @param {*} tagname 
 */
function personalizeTagname(tagname) {
	consoleLog("personalize tagname called on: " + tagname.name);
	if (isDefined(tagname.name)) {
		var elementsWithTagname = document.getElementsByTagName(tagname.name);
		var elementsWithTagnameList = Array.prototype.slice.call(elementsWithTagname);
		elementsWithTagnameList.forEach(element => {
			applySettingsOnElement(element, tagname);
		});
	}
}
/** <css changes> */
/**
 * apply page css settings
 * 1.cssFileLink: check if the profile supplies a .css file, if so add this file to the DOM.
 * 2.cssSettings: check if the profile supplies css settings, if so add them to the DOM.
 * 
 * @param {*} cssSettings 
 */
function personalizeCSS(cssSettings) {

	/* 1.cssFileLink: check if the profile supplies a .css file, if so add this file to the DOM.*/
	var cssFile = cssSettings.cssFileLink;
	consoleLog("css settings css file: " + cssFile);

	if (isDefined(cssFile)) {
		var linkIndex = cssSettings.linkIndex;
		addCSSFile(cssFile, parseInt(linkIndex));
		consoleLog("add new css called: " +cssFile);
	}
	/*2.cssSettings: check if the profile supplies css settings, if so add them to the DOM.*/
	var cssBodySettings = profile.css.cssSettings;
	if (isDefined(cssBodySettings)) {
		consoleLog("set body css called on " + cssBodySettings);
		setCSS(document.body, cssBodySettings);
	}

}


/**
 * add css file to the project
 * @param {*} cssFile 
 */
function addCSSFile(cssFile) {

	var newlink = document.createElement("LINK");
	newlink.setAttribute("rel", "stylesheet");
	newlink.setAttribute("type", "text/css");
	newlink.setAttribute("href", cssFile);
	// document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
	document.getElementsByTagName("head")[0].appendChild(newlink);
}

/** </css changes> */

/** <personzlie Attributes **/
/**
 * iterate over the attributes in the profile and change the relevant elements in the DOM 
 * according to the object-value and settings.
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
	consoleLog("new version personalizeAttribute called on: " + attribute.global_settings.name);

	var attributeName = attribute.global_settings.name;
	/*iterate over all elements with field 'attribute.name' in the DOM*/
	var elementsWithAttr = document.querySelectorAll('[' + attributeName + ']');
	elementsWithAttr.forEach(element => {
		var attrValName = element.getAttribute(attributeName);
		consoleLog("attr: " + attributeName + "= attrValName: " + attrValName);
		var attrVal = attribute[attrValName];
		personalizeAttributeValue(element, attrVal);
	});
}
/**
 * called inside personalAttribute
 * check if element is defined, apply changes in it
 * @param {*} element 
 * @param {*} attrVal 
 */
function personalizeAttributeValue(element, attrVal) {
	if (!isDefined(attrVal)) {
		consoleLog("illegal attribute value " + attrVal + " in " + element);
		return;
	}
	applySettingsOnElement(element, attrVal);
}
/** </personzlie Attributes **/

/**
 * apply settings(inside attrVal) on elements- includes inheritance!
 * This is the function where the actual changes take place(some in functions inside this one)
 * @param {*} element 
 * @param {*the object-value from the profile json as discribed in the devloper notes} attrVal 
 */
function applySettingsOnElement(element, attrVal) {

	/*check if element is of relevant tagname type (from profile). 
	Every object-value(see DeveloperNotes) can specify tagnames for types of elements it will apply to.
	if the type of the element and the type from the skin match continue. If not return
	*/
	if(isDefined(attrVal.type)){
		var isType = false;

		/*convert the tagname to upper case to avoid case thus simplifying string comparing(tagnames from profile will be uppercased as well) */
		var elementType = element.tagName.toUpperCase();

		/*check if relevant type :
		Loop over the tagname list in the profile*/
		for(var i=0; i < attrVal.type.length; i++){
			var type = attrVal.type[i];

			/*Tagnames can also be of syntax: 'not <some tagname>': */
			if(type.startsWith("not")){
				if(type.length < 5 ){
					continue;
				}
				type = type.substring(4); //remove the "not ",to check the tagname in the 'not <tagname>' declaration
				if(type.toUpperCase() === elementType){
					consoleLog("in for: change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
					return;
				}
			}else
			if(type.toUpperCase() === elementType){
				isType = true;
				break;
			}	
		}
		if(!isType){
			consoleLog("change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
			return;
		}

	}
	/*check if attribute value inherits from a different value in the profile 
	it is possible to sspecify in the inherits field a different object-value (in the profile) to refer to for the changes.
	*/
	if (isDefined(attrVal.inherits)) {
		consoleLog("inherits called on element: "+element+" with attr val: "+attrVal.name);
		var attributeName = attrVal.inherits.attributeName;
		var attributeValue = attrVal.inherits.attributeValue;
		consoleLog("inherits: attrname: "+attributeName+" attrVal: "+attributeValue );
		var inheritedAttrVal = window.profile.attributes[attributeName][attributeValue];
		applySettingsOnElement(element, inheritedAttrVal);

	} else {

		var settings = attrVal;
		consoleLog("apply settings: " + settings + " on: " + element);
		
		/*apply attribute values:
		if specified in the object value, add atributes and their values to the element.
		*/
		applyAttributeValuesChanges(element,settings);
		/*apply css changes from object-value:*/
		if (isDefined(settings.css)) {
			var styleSettings = settings.css;
			setCSS(element, styleSettings);
		}
		
		/*change text and symbol:
		if specified in the object-value, insert text and/or symbol to the dom.
		*/
		insertImage(element,settings);

		// add/change shortcut (accesskey)
		if (isDefined(settings.shortcut)) {
			element.accessKey = settings.shortcut;
		}
	}
}

/**
 * get img from the settings if exists and insert it to the element, 
 * insertion way determined by profile(symbol_insertion_type)
 * @param {*element to insert an image to} element 
 * @param {*object-value settings to determine how to create and add the image} settings 
 */

function insertImage(element, settings) {
	if (isDefined(settings.Symbol) && isDefined(settings.Symbol.url)) {

		// var mHeight = $(element).height();
		// var mWidth = $(element).width();

		consoleLog("inside insert image");
		var newImg = document.createElement('img');
		newImg.setAttribute("src", settings.Symbol.url);
		/* add a border to the image */
		addBorderToImg(newImg);
		/* if specified in the object value's Symbol section, add atributes and their values to the element. */
		applySymbolAttributeValuesChanges(newImg,settings.Symbol);
		
		/** <image size:>**/
		/* apply css changes form profile, if specified
		this class is mainly used to share image sizes between different added symbols in the profile */
		if (isDefined(settings.Symbol.css_class)) {
			consoleLog("inside css_class: "+settings.name);
			newImg.setAttribute("class", settings.Symbol.css_class);
		} 
		/*
		if a class isn't defined, it's possible to read fixed height and width from the object-value in the profile.
		*/
		else if (isDefined(settings.Symbol.height) && isDefined(settings.Symbol.width)) {
			consoleLog("inside h/w: "+settings.name);
			$(newImg).css({ height: settings.Symbol.height, width: settings.Symbol.width });
		} 
		/* if no sizes are decalared in the process, size the image in accordance to the original content size: */
		else {
			consoleLog("inside auto size: "+settings.name+"-element height: "+ $(element).height());
			$(newImg).css({ height: $(element).height()*2, width: 'auto' });
		}
		/** </image sizes> **/

		/**Symbol insertion type: determine how to insert the image change- tooltip, replace the text, append before the text, append after the text(default) **/
		if (!isDefined(settings.Symbol.symbol_insertion_type)) {
			consoleLog("inside undefined symbol_insertion_type: "+settings.name+" id:"+$(element).attr("id"));
			//TODO: what should be the default?

			/**
			 * check the "for" attr for the id of the element to add in image to.
			 */
			var label = $('[for="'+$(element).attr("id")+'"]');	
			if(isDefined(label[0])){
				$(newImg).prependTo(label[0])
			}else{
				$(element).prepend("&nbsp;");
				$(newImg).prependTo(element);
			}
		} else {
			/* replace the image, no text */
			if (settings.Symbol.symbol_insertion_type === "replace") {
				consoleLog("inside symbol_insertion_type === replace: " + settings.name);
				$(element).html('');
				$(newImg).appendTo(element);


			} 
			/* tooltip- add the image as tooltip */
			else if (settings.Symbol.symbol_insertion_type === "tooltip") {
				consoleLog("image tooltip called for: " + settings.name);
				/*add tooltip with newImg to element  */
				addToolTip(element, newImg, settings);
			} 
			/* before- insert the newimg before the current element*/
			else if (settings.Symbol.symbol_insertion_type === "before") {
				consoleLog("inside symbol_insertion_type === before: " + settings.name);
				if (isDefined(settings.text)) {
					$(element).html(settings.text);
				}

			/**
			 * check the "for" attr for the id of the element to add in image to.
			 */
				var label = $('[for="' + $(element).attr("id") + '"]');
				if (isDefined(label[0])) {
					consoleLog("with label: " + settings.name);
					$(newImg).prependTo(label[0]); //todo: insert before?
				} else {
					$(newImg).insertBefore(element);
				}
			}
		}
		consoleLog(settings.name + " settings:\ninner: " + element.innerHTML + "\nimage sizes are: h:" + $(newImg).height() + " w:" + $(newImg).width());
	}
}
/**
 * addBorderToImg()
 * @param {*} img 
 */
function addBorderToImg(img){
	$(img).css({"background-color":"white","border":"#000000 3px outset"/*,"padding":"10%"*/});
}

/**
 * create tooltip with newImg and add to element
 * @param {*the element t oadd the tooltip to} element 
 * @param {*the img to add as tooltip} newImg 
 * @param {*the object-value settings from the profile(for the text in settings.tooltip,if the tooltip has text)} settings 
 */
function addToolTip(element, newImg,settings) {
	/* create the tooltip: wrap the element in a div, add a span with the tooltip to that div */
	/*Create the warrper div and the inside span and give each and id with the same number*/
	var ctrStr = "" + gCtr++;
	var divId = 'div' + ctrStr; //e.g div15
	var spanId = 'span' + ctrStr;//e.g span15 (same number as the div)
	var divStr = '<div id="' + divId + '" </div>';
	$(element).wrap(divStr);
	var div = document.getElementById(divId);

	/*add this css class to make the div's position:relative, to be the absolute tooltip's anchor */
	$(div).addClass("aui_tooltip_parent");
	/*Create the span and add it to the div */
	var span = document.createElement("span");
	$(span).appendTo(div);
	$(span).attr("id",spanId);
	$(element).attr("aria-describedby",spanId);  //accessibility
	/* add the image to the span */
	$(newImg).appendTo(span);
	$(span).attr("role", "tooltip"); //accessibility
	$(span).addClass("aui_tooltip"); //a css class that defines how the tooltip looks and works
	var oldElem = element;
	element = div;
	$(element).attr("tabindex","0");	
	/*add text to the span */
	if(isDefined(settings.tooltip)){
		var p = document.createElement("p");
		$(p).html(settings.tooltip);
		$(p).appendTo(span);
	}

	/**
	 * define mouse and keybored show/hide functionality for the tooltip
	 */

	 /*hide the tooltip images when document is ready0 */
	$(document).ready(function () {
		consoleLog("on ready hide image called: " + spanId);
		hideImg(span);
	});
	/* show tooltip when mouse is over element*/
	$(element).mouseover(function () {
		consoleLog("mouseover called");
		showImg(span);
	});
		/* hide tooltip when mouse leaves element*/
	$(element).mouseleave(function () {
		consoleLog("mouseleave called");
		/* check if element isnt focused by keyboared before hiding */
		if (!($(element).is(":focus"))) {
			hideImg(span);
		}
	});
	/* show tooltip when keyboared focus is received*/
	$(element).focus(function () {
		consoleLog("focus called");
		showImg(span);
	});
	/* hide tooltip when keyboared focus is removed*/
	$(element).blur(function () {
		consoleLog("focusout called");
			hideImg(span);
	});
	/* show tooltip when (the profile defined) shortcut is pressed, hide when on ESC pressed*/
	$(document.body).keydown(function (ev) {

		if (isKeys(ev,settings.shortcut)) {
			$(element).focus();
			ev.preventDefault();
			return false;
		}

		if (ev.which == 27) {
			hideImg(span);
			ev.preventDefault();
			return false;
		}
	});
}
/**
 * hide the image, make it of class hidden
 * @param {*} img 
 */
function hideImg(img){
	$(img).attr("aria-hidden", "true");
	$(img).addClass("hidden"); //accessibility for old browsers
}
/**
 * show hidden image, remove class hidden
 * @param {*} img 
 */
function showImg(img){
	$(img).attr("aria-hidden", "false");
	$(img).removeClass("hidden");
}
/**
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
				$(element).css(propertyName,value);
				// element.style[propertyName] = value;
			
				// $(element).css(propertyName, value);
			}
		}
	});
}

/**
 * add classes.
 * this css classes are for defining how the tooltip looks like.
 * If defined on profile (at  window.profile.global_settings.global_tooltip_settings and  
 * window.profile.global_settings.global_tooltip_settings_mode  is "true") ), reads the changes form profile
 * todo: make it generic and extendable, read fro mthe profile/different file
 */
function addTooltipCssClasses() {

	/*Read the global tooltip ettings form the profile, if they exists use them to create the aui_tooltip class
	this class determines how the tooltip is shown */
	var globalTooltipSettingsMode = window.profile.global_settings.global_tooltip_settings_mode;
	var globalTooltipSettings = window.profile.global_settings.global_tooltip_settings;
	consoleLog("global tooltip settings: "+globalTooltipSettings);
	consoleLog("global tooltip settings mode: "+globalTooltipSettingsMode)
	if ( isDefined(globalTooltipSettings) && 
	( (!isDefined(globalTooltipSettingsMode)) || globalTooltipSettingsMode === "true") ) {
		createCssClassFromJson('.aui_tooltip',globalTooltipSettings);
	} else {
		createCssClass('.aui_tooltip',
			// 'margin:auto;'+
			// 'text-align:center;'+
			'background:black; ' +
			'font-size:14px;' +
			'font-weight:regular;' +
			'position:absolute;' +
			// 'top:40px;'+
			// 'right:20%;'+
			// 'left:100%;'+
			'overflow:visible;' +
			'padding:17px 17px 0px;' +
			'color:#fff;' +
			'-webkit-border-radius:7px;' +
			'-moz-border-radius:7px;' +
			'border-radius:7px;' +
			'-webkit-background-clip:padding-box;' +
			'-moz-background-clip:padding;' +
			'background-clip:padding-box;' +
			'margin-bottom: 20%;' +
			'text-align:center;' +
			'text-decoration:none;' +
			'box-shadow:0 0 3px #000;' +
			'z-index:99999999;' +
			// 'vertical-align:middle;'+
			// 'justify-content:center;'+
			// 'flex-direction: column;'+
			// 'margin-top:auto;margin-bottom:auto;'
			'align-items:center;'
		);
	}
	createCssClass('.aui_tooltip_parent',
	"position:relative;");
	createCssClass('[aria-hidden="true"]', 'display: none;');
	createCssClass('[aria-hidden="false"]', 'display: block;');
	createCssClass('a:focus, a:active', 'text-decoration: underline;');
	// createCssClass('aui_tooltip_child',);
	// createCssClass('aui_tooltip_span',
	// 'vertical-align:center;'
	// 'display: flex;'+
	// 'align-items: center;'+
	// 'justify-content:center;'
	// );
	
}
/**
 * create and add a css calss to the dom
 * @param {*class name of css class to add, syntax: ".classname"} className 
 * @param {*string of css class properties code (e.g " color:black; height=100px;...  ")} propertiesStr 
 */
function createCssClass(className,propertiesStr){
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = className+' { '+propertiesStr+' }';
	document.getElementsByTagName('head')[0].appendChild(style);
	// document.getElementById('someElementId').className = ;
}
/**
 * 
 * @param {*class name of css class to add, syntax: ".classname"} className 
 * @param {*a json object with the css class properties in key:value pairs} propertiesJson 
 */
function createCssClassFromJson(className,propertiesJson){
	consoleLog("create css class from json called")
	propertiesJsonKeys = Object.keys(propertiesJson);
	var propertiesStr = "";
	propertiesJsonKeys.forEach(cssClassPropertyKey=>{
		propertiesStr+= cssClassPropertyKey+":"+propertiesJson[cssClassPropertyKey]+";"
	});
	createCssClass(className,propertiesStr);
}
/**
 * check if the click event(the keyboared keys clicked) match the profile deifned keys.
 * if it does return true, otherwie false.
 * @param {*} event 
 * @param {*} keys 
 */
function isKeys(event,keys){
	consoleLog("is keys called: "+event.which+" : "+keys);
	if(!isDefined(keys)){
		return false;
	}
	/* check if the profile defined keys are a combination of a modifier key + key, i.e Shift+A */
	if(keys.indexOf("+") > -1){
		var arr = keys.split("+").map(function(item) {
			return item.trim();
		});
		if(checkModifier(arr[0],event) && event.which == arr[1].charCodeAt(0)){
			return true;
		}
		return false;
	}else{
		/*todo: FIX TO FIT MODIFIER KEYS like ctrl shift alt */
		return event.which == keys.charCodeAt(0);
	}
}
/**
 * return true if variable is not: null,undefined or empty.
 * @param {*} variable 
 */
function isDefined(variable) {
	if (variable != null && variable != undefined && variable != "")
		return true;
	return false;

}
/**
 * return true if modifier button was part of the keybored click event
 * @param {*keyboard modifier string(Alt,Ctrl,Shift)} modifierStr 
 * @param {*click event} event 
 */
function checkModifier(modifierStr,event){

	if(modifierStr === "Shift" && event.shiftKey){
		return true;
	}
	if(modifierStr === "Ctrl" && event.ctrlKey){
		return true;
	}
	if(modifierStr === "Alt" && event.altKey){
		return true;
	}
	return false;
}

/**
 * NOT USED YET
 * determine location of tooltip span to avoid zIndex bug
 * @param {*} span 
 * @param {*} element 
 */
function positionSpan(span,element){

	// var addToTop = -1.5*element.height;
	// var addToLeft = -500;
	var bodyRect = document.body.getBoundingClientRect();
    var elemRect = element.getBoundingClientRect();
	var top_offset = elemRect.top - bodyRect.top;
	var left_offset = elemRect.left - bodyRect.left;
	consoleLog('Element is ' + top_offset + ' vertical pixels from <body>');
	consoleLog('Element is ' + left_offset + ' horizontal pixels from <body>');
	consoleLog("bodyRect: top: "+bodyRect.top+" left: "+bodyRect.left);
	consoleLog("elemRect: top: "+elemRect.top+" left: "+elemRect.left);

	span.style.top = elemRect.top;
	span.style.left = elemRect.left;
	var p = $(span).position();
	consoleLog("span left: "+p.left+" top: "+p.top);

	// span.style.top = top_offset + addToTop;
	// span.style.left = left_offset +addToLeft;
}
/**
 * look for aui-distraction elements in the dom and act accordingly
 * (hide them if they are from the distractions typesread form the profile).
 */
function personalizeDistraction() {

	/*animations, auto-starting, moving, ad, message, chat , overlay, popup
Auto-changing (logs) third-party, offer ( includes suggestions). */

	var distStr = window.profile["aui-distraction"];
	consoleLog("personalize distraction called. distStr: "+distStr);
	if (!isDefined(distStr)) {
		return;
	}
	if (distStr === "all") {
		$("[aui-distraction]").each(function (index) {
			consoleLog("distraction element: "+$(this).html());
			$(this).attr("aria-hidden", "true");
		});
		return;
	}
	var distractionsArray = distStr.split(",").map(function (item) {
		return item.trim();
	});

	distractionsArray.forEach(distractionType => {
		$("[aui-distraction='" + distractionType + "']").each(function (index) {
			$(this).attr("aria-hidden", "true");
		});
	});
}

/**
 * console.log for the text (encapsulated to be able to turn log off easily)
 * @param {*} text 
 */
function consoleLog(text){
	console.log(text);
}

/**
 * add field&value pairs (from the profile) to the element
 * @param {*} element 
 * @param {*} settings 
 */
function applyAttributeValuesChanges(element,settings){
	if(isDefined(settings["attribute_values_changes"])){
		console.log("apply attribute value changes called on: "+settings.name);
		var attributeValuesChanges = settings["attribute_values_changes"];
		var attributeValuesChangesKeyList = Object.keys(attributeValuesChanges);
		attributeValuesChangesKeyList.forEach(attrName=>{
			$(element).attr(attrName,attributeValuesChanges[attrName]);
		});
	}
}
/**
 * add attr&value pairs (from the profile) to the element
 * @param {*} element 
 * @param {*} symbolSettings 
 */
function applySymbolAttributeValuesChanges(element,symbolSettings){
	if(isDefined(symbolSettings["symbol_attribute_values_changes"])){
		console.log("apply attribute value changes called on: "+symbolSettings.name);
		var attributeValuesChanges = symbolSettings["symbol_attribute_values_changes"];
		var attributeValuesChangesKeyList = Object.keys(attributeValuesChanges);
		attributeValuesChangesKeyList.forEach(attrName=>{
			$(element).attr(attrName,attributeValuesChanges[attrName]);
		});
	}
}
