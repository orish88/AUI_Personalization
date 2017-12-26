
Profile.json structure:
{
    ***Global profile info:***

    "name": "insert name of profile here",
    "AUI:desc": "insert profile description",


    ***CSS:***

    "css":{
        //If you have a css file you want to apply on the page:
        "cssFileLink": "https://...css_file_link_here.css",
        "linkIndex": the number of link in the webstie where the css is declared,usally "0",
        //If you want to add further css changes, outside the file:
        "cssSettings":[
            //additional css settings array with objects of the following format:
            {
                "propertyName":"some css property",
                "value": "some property value"
            }
            ...
        ]
    }

    ***Simplification:***
    
    //if you wish to control the importance 
    //of elements showing on the page, use this field:

    //add Simplification Level:
    "simplification": "lvl"
    // lvl can be:
    //      1. "critical" - only unmarked (no simplification field) and critical elements will show.
    //      2. "high"- only critical and high elements will show.
    //      3. "medium"- only critical high and medium elements will show.
    //      4. "low" - everything will show

    ***TagNames:***
    //If you wish to make the same changes t o all elements of a certain tagname
    // in a page, use:

    "tagNames":{

        //tagname change information object is of the following format (you may have multiple objects)
        "your_tagname":{ //new change object:
            "name": "your_tagname" //it's essential this value and the key will be the same.
            //rest see ***change object example***
        }

    }

    ***Attributes***
    
    // DOM elements may have certain attributes which you'd wish to change them according to
    // the attribute and it's value. i.e if a DOM elements has "aui-destination" = "home",
    // you might want your profile to have a change object ready to apply changes on that element.
    //You can decalre this change objects under the "attributes" global key, in the following format:

    "attributes":{
        "attribute-name1"{

            //a place to put data that is global to this attribute name, regardless of the value.
            "global_settings":{
                "name": "attribute-name1"
                ...
            }

            //change objects for possible values:
 
            "value1":    //(example- "home")
            {
                "name":"value1",
                //rest see ***change object example***
            },

            "value2":
            {
                "name":"value2",
                //rest see ***change object example***
            }
            ...more change objects with values as keys

        },
        "attribute-name2":{...}
    }

    ***Scopes***
    //There are some special cases of multiple attribute dependency. 
    // You may wish to have a change object for certain attribute attr1 = "val1" while 
    // any val received in "attr2" = "val2" IN ANY ELEMENT UNDER THE attr1 scope,
    //will have its own change object.

    //So far the script supports the cases of "itemprop" under "itemtype" and "name" 
    // under "autocomplete" 
    //the change objects will be decalred under global kry "scopes", in the folllowing format:

    "scopes":{
        "itemtypes": {
            "itemtype_value1": //usually of the format "http://schema.org/something"
            "itemprops":{

                "item_prop_value1":{ change object },
                "item_prop_value2":{ change object },
                ...
            },
            more itemtype values here...
        }
        "autocomplete":{
            "on" {
                "names":{
                    "name value1":{ change object},
                    ...
                }

            }
        }
    }



}


*** change object example ***
{
   "name": change_object_name("compose", in this example),
    "type": [
        //an array of tagnames that an element changed by this object will have
        // to fit in order for the changes to take place.
        //example1:
        "a","p" //this change object will only apply in elemts of tagname a or p.
        //example2
        "not a" //this change object will aplly in all elements except elements of tagname a.
                    
    ],
    "inherits": {
        "attributeName": "AUI-destination",
        "attributeValue": "home"
    },
    "shortcut": "SHIFT + C",
    "longdesc": "some element description",
    "tooltip": "this text will show when user hovers on the element",
    "text": "replace current text with this (empty = current text stays)",
    //add an image to the element
    "Symbol": {
        //add image to your element
        "url": "http://cdn4.iconfinder.com/data/icons/miu/22/common_new_edit_compose_-128.png",
        "replacetext": "true", //put true if you wish the image will show alone with no added text(yours or original), false otherwise.

        //supply info of image creator
        "creator": {
            "name": "",
            "url": ""
        }
        //image size settings:
        "width": "",
        "height": "",
        "margin": "",
        "padding": ""
    },
    "css":[
        //additional css settings array with objects of the following format:
        {
            "propertyName":"some css property",
            "value": "some property value"
        },
        ...
    ]
}


