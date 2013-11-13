function GetPluginSettings()
{
	return {
		"name":			"Firebase",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"Firebase",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"0.31",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Real time database-as-a-service",
		"author":		"Tom Larkworthy",
		"help url":		"www.scirra.com",
		"category":		"Web",				    // Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		pf_singleglobal,
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
			
AddStringParam("Tag", "The callback identifier", "my tag");
AddCondition(0,	cf_trigger, "Firebase callback", "Firebase", "<b>{0}</b> event", "Triggered when Firebase changes", "Callback");


AddCondition(500, cf_trigger, "Login success", "Login", "login success", "Triggered on user login", "LoginSuccess");
AddCondition(501, cf_trigger, "Login error", "Login", "login failed", "Triggered when user fails to login", "LoginFail");

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddStringParam("String Value", "The value to set");
AddAction(0, 0, "Set String Value", "Firebase", "Set String<i>{0}</i> to <i>{1}</i>", "Sets a string value of the data ref", "SetString");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddStringParam("JSON Value", "The object/JSON to set");
AddAction(1, 0, "Set JSON Value", "Firebase", "Set Number<i>{0}</i> to <i>{1}</i>", "Sets an object/JSON value of the data ref", "SetJSON");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddNumberParam("Number Value", "The number to set");
AddAction(2, 0, "Set Number Value", "Firebase", "Set JSON<i>{0}</i> to <i>{1}</i>", "Sets a number value of the data ref", "SetNumber");


AddStringParam("DataRef", "The Firebase data ref extension", "\"/myref\"");
AddStringParam("Tag",     "The tag to identify the callback", "my tag");
AddComboParamOption("value");
AddComboParamOption("child_added");
AddComboParamOption("child_changed");
AddComboParamOption("child_removed");
AddComboParamOption("child_moved");
AddComboParam("eventType ", "which Firebase event type to register")	;
AddAction(3, 0, "Register Callback", "Firebase", "<i>{2}</i> callback for <i>{0}</i> registered under <i>{1}</i>", "Triggered when the Firebase changes", "RegisterCallback");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddStringParam("JSON Value", "The value to update to");
AddAction(4, 0, "UpdateJSON", "Firebase", "Update <i>{0}</i> to <i>{1}</i>", "Updates values at the data ref", "UpdateJSON");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddStringParam("String Value", "The value to push");
AddAction(5, 0, "Push String", "Firebase", "Push String <i>{0}</i> with <i>{1}</i>", "Pushes a value on the list at data ref", "PushString");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddNumberParam("Number Value", "The value to push");
AddAction(6, 0, "Push Number", "Firebase", "Push Number <i>{0}</i> with <i>{1}</i>", "Pushes a value on the list at data ref", "PushNumber");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddStringParam("JSON Value", "The value to push");
AddAction(7, 0, "Push JSON", "Firebase", "Push JSON <i>{0}</i> with <i>{1}</i>", "Pushes a value on the list at data ref", "PushJSON");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddAction(8, 0, "Remove", "Firebase", "Remove data at <i>{0}</i>", "Removes the data at the data ref", "Remove");


///////////////LOGINS////
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("rememberMe", "keeps the user session for 30 days");
AddStringParam("scope", "A comma-delimited list of requested extended permissions");
AddAction(500, 0, "Login Facebook", "Login", "Login user with Facebook", "Login user with Facebook", "LoginFB");

AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("rememberMe", "keeps the user session for 30 days");
AddStringParam("email", "user email");
AddStringParam("password", "user password");
AddAction(501, 0, "Login Password", "Login", "Login user with email+password", "Login user with Login user with email+password", "LoginEmailPassword");


//////////////////////////////////////////////////////////////
// Expressions
//AddExpression(id, flags, list_name, category, expression_name, description);
AddExpression(0, ef_return_string, "Get value as a string", "Firebase", "ValString", "string data received by the trigger as a string");
AddExpression(1, ef_return_string, "Get value as a object JSON", "Firebase", "ValJSON", "object data received by the trigger as a JSON");
AddExpression(2, ef_return_string, "Get value as a number", "Firebase", "ValNumber", "object data received by the trigger as a Number");
AddExpression(3, ef_return_string, "Get data reference", "Firebase", "Ref", "URL location of data received by the trigger");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
	new cr.Property(ept_text,	"Firebase Domain", "https://construct2example.firebaseio.com/", "The root location of the Firebase data")
];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}