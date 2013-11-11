// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");
/**
The main trick of mapping Firebase callbacks such as :

myDataRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
});


Every callback type {Value, Child Added, Child Changed, Child Removed, Child Moved), is
associated with a callback dictionary indexed by dataRef

When a trigger condition e.g. onValue is evaluated, a proper Firebase ref is lazily created with an array

The trigger checks to see if the array is empty or not and pulls the entry out and fills out the data.

The actual firebase callback pushes data onto the array. 

This allows Firebase to push lots of data faster than C2 ticks.

*/
/////////////////////////////////////
// Plugin class
cr.plugins_.Firebase = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var isNodeWebkit = false;
	var path = null;
	var fs = null;
	var nw_appfolder = "";
	
	var pluginProto = cr.plugins_.Firebase.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		this.lastData = "";
		this.lastString = "";
		
		//lazy storage of refs
		//we create Firebase refs lazily on demand (so we don't have multiple identical refs open)
		this.refs = {}		
		this.get_ref = function(ref){
			if(ref in this.refs){
				//ref was already setup
			}else{
				this.refs[ref] = new Firebase(this.domain + ref);
			}
			return this.refs[ref];			
		};
		
		//mapping of data refs to array of snapshots
		//every time a message received from firebase, 
		//it is snapshot is pushed onto the correct queue
		//when the the on value condition is evalued, the queue is tested for emptyness,
		//and shift() off if there is on
		//we use a queue so firebase can deliver data faster than the C2 runtime ticks
		this.value_callback_snapshots = {};
		this.get_value_callback_snapshots = function(ref){
			if(ref in this.value_callback_snapshots){
				//snapshot storage was already setup
			}else{
				//lazy create an array, and build callback to fill it
				var array = [];
				var dataref = this.get_ref(ref);
				dataref.on('value', function(snapshot){
					array.push(snapshot);//push data on array when firebase responds
				});
				this.value_callback_snapshots[ref] = array; //associate array in map
			}
			return this.value_callback_snapshots[ref];			
		};
		
		isNodeWebkit = this.runtime.isNodeWebkit;
		
		if (isNodeWebkit)
		{
			path = require("path");
			fs = require("fs");
			nw_appfolder = path["dirname"](process["execPath"]) + "\\";
		}
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	var theInstance = null;
	
	instanceProto.onCreate = function()
	{
		theInstance = this;
		this.domain = this.properties[0];
	};
	
	instanceProto.doRequest = function (tag_, url_, method_, data_)
	{
		// In directCanvas: forward request to webview layer
		if (this.runtime.isDirectCanvas)
		{
			AppMobi["webview"]["execute"]('C2_Firebase_WebSide("' + tag_ + '", "' + url_ + '", "' + method_ + '", ' + (data_ ? '"' + data_ + '"' : "null") + ');');
			return;
		}
		
		// Create a context object with the tag name and a reference back to this
		var self = this;
		var request = null;
		
		var doErrorFunc = function ()
		{
			self.curRef = tag_;
			self.runtime.trigger(cr.plugins_.Firebase.prototype.cnds.OnError, self);
		};
		
		var errorFunc = function ()
		{
			// In node-webkit, try looking up the file on disk instead since it wasn't found in the project.
			if (isNodeWebkit)
			{
				var filepath = nw_appfolder + url_;
				
				if (fs["existsSync"](filepath))
				{
					fs["readFile"](filepath, {"encoding": "utf8"}, function (err, data) {
						if (err)
						{
							doErrorFunc();
							return;
						}
						
						self.lastData = data.replace(/\r\n/g, "\n")
						self.runtime.trigger(cr.plugins_.Firebase.prototype.cnds.OnComplete, self);
					});
				}
				else
					doErrorFunc();
			}
			else
				doErrorFunc();
		};
			
		var progressFunc = function (e)
		{
			if (!e["lengthComputable"])
				return;
				
			self.progress = e.loaded / e.total;
			self.curRef = tag_;
			self.runtime.trigger(cr.plugins_.Firebase.prototype.cnds.OnProgress, self);
		};
			
		try
		{
			request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				// Note: node-webkit leaves status as 0 for local Firebase requests, presumably because
				// they are local requests and don't have a HTTP response.  So interpret 0 as success
				// in this case.
				if (request.readyState === 4 && (isNodeWebkit || request.status !== 0))
				{
					self.curRef = tag_;
					
					if (request.status >= 400)
						self.runtime.trigger(cr.plugins_.Firebase.prototype.cnds.OnError, self);
					else
					{
						self.lastData = request.responseText.replace(/\r\n/g, "\n");		// fix windows style line endings
						
						// In node-webkit, don't trigger 'on success' with empty string if file not found
						if (!isNodeWebkit || self.lastData.length)
							self.runtime.trigger(cr.plugins_.Firebase.prototype.cnds.OnComplete, self);
					}
				}
			};
			request.onerror = errorFunc;
			request.ontimeout = errorFunc;
			request.onabort = errorFunc;
			request["onprogress"] = progressFunc;
			
			request.open(method_, url_);
			
			// Workaround for CocoonJS bug: property exists but is not settable
			try {
				request.responseType = "text";
			} catch (e) {}
			
			if (method_ === "POST" && data_)
			{
				if (request["setRequestHeader"])
				{
					request["setRequestHeader"]("Content-Type", "application/x-www-form-urlencoded");
				}
					
				request.send(data_);
			}
			else
				request.send();
			
		}
		catch (e)
		{
			errorFunc();
		}
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Firebase",
			"properties": [
				{"name": "Last data", "value": this.lastString, "readonly": true}
			]
		});
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnValue = function (ref)
	{
		var snapshots = this.get_value_callback_snapshots(ref)
		if (snapshots.length == 0){
			return false;
		}else{
			var snapshot = snapshots.shift(); //pull data off front of queue
			this.lastString = snapshot.val();
			return true;
		}
	};
	
	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.SetString = function (ref_, val_)
	{
		var ref = this.get_ref(ref_);
		ref.set(val_);
	};
	
	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.LastString = function (ret)
	{
		ret.set_string(this.lastString);
	};
	
	pluginProto.exps = new Exps();
}());