(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Autocomplete = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _simulant = require('simulant');

var _simulant2 = _interopRequireDefault(_simulant);

var _addressAutcomplete = require('../src/address-autcomplete.js');

var _addressAutcomplete2 = _interopRequireDefault(_addressAutcomplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */
/* global it, describe, expect, beforeEach, $, Cookies, FeatureFlagons, beforeAll, afterEach */

var openDropDown = function openDropDown() {

    var formInput = window.AC.elements.autoCompleteInput;
    formInput.focus();
    formInput.setAttribute('value', '12');
    _simulant2.default.fire(formInput, 'keyup');
};

describe('Google custom autocomplete dropdown', function () {

    beforeEach(function () {

        window.AC = new _addressAutcomplete2.default({
            parent: 'body',
            suburbs: [{
                label: 'Sydney NSW 2000',
                value: '2342243'
            }, {
                label: 'Ryde NSW 2000',
                value: '123654'
            }],
            fields: {
                state: false,
                postcode: false
            }
        });
    });

    afterEach(function () {
        window.AC.cleanUp();
    });

    it('It returns results from google.', function (done) {

        window.AC._getResult('41', function (result) {
            expect(result.length).toBeGreaterThan(0);
            done();
        });
    }, 10000);

    it('It creates dom elements from a string', function () {
        expect(window.AC._generateElements().getAttribute('class')).toEqual('autocomplete-wrapper');
    });

    it('It creates an input field in the page', function () {
        var eleCon = document.querySelector('.autocomplete-wrapper').constructor;
        var compEleCon = document.createElement('div').constructor;
        expect(eleCon).toEqual(compEleCon);
    });

    it('It is showing the autocomplete form', function () {
        expect(window.AC.elements.manualForm.style.display === 'none' && window.AC.elements.autocompleteForm.style.display === 'block').toEqual(true);
    });

    it('It is showing the manual completion form', function () {
        window.AC.currentForm = 'manual';
        expect(window.AC.elements.manualForm.style.display === 'block' && window.AC.elements.autocompleteForm.style.display === 'none').toEqual(true);
    });

    it('Clicking cant find address changes form view', function (done) {

        var eles = window.AC.elements;
        var clickable = document.querySelector('[data-form-toggle]');
        var e = new Event('click');

        var test = [eles.manualForm.style.display === 'none' && eles.autocompleteForm.style.display === 'block'];

        clickable.addEventListener('click', function () {
            test.push(eles.manualForm.style.display === 'block' && eles.autocompleteForm.style.display === 'none');
            expect(test.toString()).toEqual([true, true].toString());
            done();
        });

        clickable.dispatchEvent(e);
    }, 5000);

    // it('it shows results on key input', done => {

    //     openDropDown();

    //     console.log('here');

    //     window.AC.options.resultsUpdated = () => {

    //         console.log('here 2');

    //         expect(document.querySelector('.awesomplete ul').children.length).toBe(1);
    //         done();

    //     };

    // }, 1000);

    // it('A result is exposed once chosen from dropdown', done => {

    //     window.AC.options.placeSelected = () => {

    //         const result = Object.keys(window.AC.result).map((item) => {
    //             return window.AC.result[item] !== undefined;
    //         });

    //         expect(result.indexOf(false) === -1 && result.length > 0).toBe(true);
    //         done();

    //     };


    //     window.AC.options.resultsUpdated = () => {

    //         const ele = document.querySelector('.awesomplete ul');
    //         const eleChild = ele.children[0];
    //         simulant.fire(eleChild, 'mousedown', {relatedTarget: ele});

    //     };

    //     openDropDown();

    // }, 5000);


    it('adds the stop class when invalid', function () {

        window.AC.validate();

        var manualForm = document.querySelector('[data-manual-form]');

        var inputs = Array.from(manualForm.querySelector('input, select')).map(function (item) {
            return item.classList.contains('stop');
        });

        expect(inputs.indexOf(false)).toBe(-1);
    });

    it('Shows error on null value', function () {

        // const result = Object.keys(window.AC.result).map((item) => {
        //     return window.AC.result[item] !== undefined;
        // });

        // expect(result.indexOf(false)).toBe(-1);

    });
});

},{"../src/address-autcomplete.js":4,"simulant":3}],2:[function(require,module,exports){
/**
 * Simple, lightweight, usable local autocomplete library for modern browsers
 * Because there weren’t enough autocomplete scripts in the world? Because I’m completely insane and have NIH syndrome? Probably both. :P
 * @author Lea Verou http://leaverou.github.io/awesomplete
 * MIT license
 */

(function () {

var _ = function (input, o) {
	var me = this;

	// Setup

	this.input = $(input);
	this.input.setAttribute("autocomplete", "off");
	this.input.setAttribute("aria-autocomplete", "list");

	o = o || {};

	configure(this, {
		minChars: 2,
		maxItems: 10,
		autoFirst: false,
		data: _.DATA,
		filter: _.FILTER_CONTAINS,
		sort: _.SORT_BYLENGTH,
		item: _.ITEM,
		replace: _.REPLACE
	}, o);

	this.index = -1;

	// Create necessary elements

	this.container = $.create("div", {
		className: "awesomplete",
		around: input
	});

	this.ul = $.create("ul", {
		hidden: "hidden",
		inside: this.container
	});

	this.status = $.create("span", {
		className: "visually-hidden",
		role: "status",
		"aria-live": "assertive",
		"aria-relevant": "additions",
		inside: this.container
	});

	// Bind events

	$.bind(this.input, {
		"input": this.evaluate.bind(this),
		"blur": this.close.bind(this, { reason: "blur" }),
		"keydown": function(evt) {
			var c = evt.keyCode;

			// If the dropdown `ul` is in view, then act on keydown for the following keys:
			// Enter / Esc / Up / Down
			if(me.opened) {
				if (c === 13 && me.selected) { // Enter
					evt.preventDefault();
					me.select();
				}
				else if (c === 27) { // Esc
					me.close({ reason: "esc" });
				}
				else if (c === 38 || c === 40) { // Down/Up arrow
					evt.preventDefault();
					me[c === 38? "previous" : "next"]();
				}
			}
		}
	});

	$.bind(this.input.form, {"submit": this.close.bind(this, { reason: "submit" })});

	$.bind(this.ul, {"mousedown": function(evt) {
		var li = evt.target;

		if (li !== this) {

			while (li && !/li/i.test(li.nodeName)) {
				li = li.parentNode;
			}

			if (li && evt.button === 0) {  // Only select on left click
				evt.preventDefault();
				me.select(li, evt.target);
			}
		}
	}});

	if (this.input.hasAttribute("list")) {
		this.list = "#" + this.input.getAttribute("list");
		this.input.removeAttribute("list");
	}
	else {
		this.list = this.input.getAttribute("data-list") || o.list || [];
	}

	_.all.push(this);
};

_.prototype = {
	set list(list) {
		if (Array.isArray(list)) {
			this._list = list;
		}
		else if (typeof list === "string" && list.indexOf(",") > -1) {
				this._list = list.split(/\s*,\s*/);
		}
		else { // Element or CSS selector
			list = $(list);

			if (list && list.children) {
				var items = [];
				slice.apply(list.children).forEach(function (el) {
					if (!el.disabled) {
						var text = el.textContent.trim();
						var value = el.value || text;
						var label = el.label || text;
						if (value !== "") {
							items.push({ label: label, value: value });
						}
					}
				});
				this._list = items;
			}
		}

		if (document.activeElement === this.input) {
			this.evaluate();
		}
	},

	get selected() {
		return this.index > -1;
	},

	get opened() {
		return !this.ul.hasAttribute("hidden");
	},

	close: function (o) {
		if (!this.opened) {
			return;
		}

		this.ul.setAttribute("hidden", "");
		this.index = -1;

		$.fire(this.input, "awesomplete-close", o || {});
	},

	open: function () {
		this.ul.removeAttribute("hidden");

		if (this.autoFirst && this.index === -1) {
			this.goto(0);
		}

		$.fire(this.input, "awesomplete-open");
	},

	next: function () {
		var count = this.ul.children.length;

		this.goto(this.index < count - 1? this.index + 1 : -1);
	},

	previous: function () {
		var count = this.ul.children.length;

		this.goto(this.selected? this.index - 1 : count - 1);
	},

	// Should not be used, highlights specific item without any checks!
	goto: function (i) {
		var lis = this.ul.children;

		if (this.selected) {
			lis[this.index].setAttribute("aria-selected", "false");
		}

		this.index = i;

		if (i > -1 && lis.length > 0) {
			lis[i].setAttribute("aria-selected", "true");
			this.status.textContent = lis[i].textContent;

			$.fire(this.input, "awesomplete-highlight", {
				text: this.suggestions[this.index]
			});
		}
	},

	select: function (selected, origin) {
		if (selected) {
			this.index = $.siblingIndex(selected);
		} else {
			selected = this.ul.children[this.index];
		}

		if (selected) {
			var suggestion = this.suggestions[this.index];

			var allowed = $.fire(this.input, "awesomplete-select", {
				text: suggestion,
				origin: origin || selected
			});

			if (allowed) {
				this.replace(suggestion);
				this.close({ reason: "select" });
				$.fire(this.input, "awesomplete-selectcomplete", {
					text: suggestion
				});
			}
		}
	},

	evaluate: function() {
		var me = this;
		var value = this.input.value;

		if (value.length >= this.minChars && this._list.length > 0) {
			this.index = -1;
			// Populate list with options that match
			this.ul.innerHTML = "";

			this.suggestions = this._list
				.map(function(item) {
					return new Suggestion(me.data(item, value));
				})
				.filter(function(item) {
					return me.filter(item, value);
				})
				.sort(this.sort)
				.slice(0, this.maxItems);

			this.suggestions.forEach(function(text) {
					me.ul.appendChild(me.item(text, value));
				});

			if (this.ul.children.length === 0) {
				this.close({ reason: "nomatches" });
			} else {
				this.open();
			}
		}
		else {
			this.close({ reason: "nomatches" });
		}
	}
};

// Static methods/properties

_.all = [];

_.FILTER_CONTAINS = function (text, input) {
	return RegExp($.regExpEscape(input.trim()), "i").test(text);
};

_.FILTER_STARTSWITH = function (text, input) {
	return RegExp("^" + $.regExpEscape(input.trim()), "i").test(text);
};

_.SORT_BYLENGTH = function (a, b) {
	if (a.length !== b.length) {
		return a.length - b.length;
	}

	return a < b? -1 : 1;
};

_.ITEM = function (text, input) {
	var html = input === '' ? text : text.replace(RegExp($.regExpEscape(input.trim()), "gi"), "<mark>$&</mark>");
	return $.create("li", {
		innerHTML: html,
		"aria-selected": "false"
	});
};

_.REPLACE = function (text) {
	this.input.value = text.value;
};

_.DATA = function (item/*, input*/) { return item; };

// Private functions

function Suggestion(data) {
	var o = Array.isArray(data)
	  ? { label: data[0], value: data[1] }
	  : typeof data === "object" && "label" in data && "value" in data ? data : { label: data, value: data };

	this.label = o.label || o.value;
	this.value = o.value;
}
Object.defineProperty(Suggestion.prototype = Object.create(String.prototype), "length", {
	get: function() { return this.label.length; }
});
Suggestion.prototype.toString = Suggestion.prototype.valueOf = function () {
	return "" + this.label;
};

function configure(instance, properties, o) {
	for (var i in properties) {
		var initial = properties[i],
		    attrValue = instance.input.getAttribute("data-" + i.toLowerCase());

		if (typeof initial === "number") {
			instance[i] = parseInt(attrValue);
		}
		else if (initial === false) { // Boolean options must be false by default anyway
			instance[i] = attrValue !== null;
		}
		else if (initial instanceof Function) {
			instance[i] = null;
		}
		else {
			instance[i] = attrValue;
		}

		if (!instance[i] && instance[i] !== 0) {
			instance[i] = (i in o)? o[i] : initial;
		}
	}
}

// Helpers

var slice = Array.prototype.slice;

function $(expr, con) {
	return typeof expr === "string"? (con || document).querySelector(expr) : expr || null;
}

function $$(expr, con) {
	return slice.call((con || document).querySelectorAll(expr));
}

$.create = function(tag, o) {
	var element = document.createElement(tag);

	for (var i in o) {
		var val = o[i];

		if (i === "inside") {
			$(val).appendChild(element);
		}
		else if (i === "around") {
			var ref = $(val);
			ref.parentNode.insertBefore(element, ref);
			element.appendChild(ref);
		}
		else if (i in element) {
			element[i] = val;
		}
		else {
			element.setAttribute(i, val);
		}
	}

	return element;
};

$.bind = function(element, o) {
	if (element) {
		for (var event in o) {
			var callback = o[event];

			event.split(/\s+/).forEach(function (event) {
				element.addEventListener(event, callback);
			});
		}
	}
};

$.fire = function(target, type, properties) {
	var evt = document.createEvent("HTMLEvents");

	evt.initEvent(type, true, true );

	for (var j in properties) {
		evt[j] = properties[j];
	}

	return target.dispatchEvent(evt);
};

$.regExpEscape = function (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
};

$.siblingIndex = function (el) {
	/* eslint-disable no-cond-assign */
	for (var i = 0; el = el.previousElementSibling; i++);
	return i;
};

// Initialization

function init() {
	$$("input.awesomplete").forEach(function (input) {
		new _(input);
	});
}

// Are we in a browser? Check for Document constructor
if (typeof Document !== "undefined") {
	// DOM already loaded?
	if (document.readyState !== "loading") {
		init();
	}
	else {
		// Wait for it
		document.addEventListener("DOMContentLoaded", init);
	}
}

_.$ = $;
_.$$ = $$;

// Make sure to export Awesomplete on self when in a browser
if (typeof self !== "undefined") {
	self.Awesomplete = _;
}

// Expose Awesomplete as a CJS module
if (typeof module === "object" && module.exports) {
	module.exports = _;
}

return _;

}());

},{}],3:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.simulant = factory());
}(this, function () { 'use strict';

	var defaults = {
		bubbles:       true,
		cancelable:    true,
		view:          window,
		detail:        null,
		screenX:       0,
		screenY:       0,
		clientX:       0,
		clientY:       0,
		ctrlKey:       false,
		altKey:        false,
		shiftKey:      false,
		metaKey:       false,
		button:        0,
		relatedTarget: null,
		locale:        '',
		oldURL:        '',
		newURL:        '',
		origin:        '',
		lastEventId:   '',
		source:        null,
		ports:         [],
		oldValue:      null,
		newValue:      null,
		url:           '',
		storageArea:   null,
		deltaX:        0,
		deltaY:        0,
		deltaZ:        0,
		deltaMode:     0
	};


	// TODO remove the ones that aren't supported in any browser
	var eventTypesByGroup = {
		UIEvent:                     'abort error resize scroll select unload',
		Event:                       'afterprint beforeprint cached canplay canplaythrough change chargingchange chargingtimechange checking close dischargingtimechange DOMContentLoaded downloading durationchange emptied ended fullscreenchange fullscreenerror input invalid levelchange loadeddata loadedmetadata noupdate obsolete offline online open orientationchange pause pointerlockchange pointerlockerror play playing ratechange readystatechange reset seeked seeking stalled submit success suspend timeupdate updateready visibilitychange volumechange waiting',
		AnimationEvent:              'animationend animationiteration animationstart',
		AudioProcessingEvent:        'audioprocess',
		BeforeUnloadEvent:           'beforeunload',
		TimeEvent:                   'beginEvent endEvent repeatEvent',
		FocusEvent:                  'blur focus focusin focusout',
		MouseEvent:                  'click contextmenu dblclick mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup show',
		SensorEvent:                 'compassneedscalibration userproximity',
		OfflineAudioCompletionEvent: 'complete',
		CompositionEvent:            'compositionend compositionstart compositionupdate',
		ClipboardEvent:              'copy cut paste',
		DeviceLightEvent:            'devicelight',
		DeviceMotionEvent:           'devicemotion',
		DeviceOrientationEvent:      'deviceorientation',
		DeviceProximityEvent:        'deviceproximity',
		DragEvent:                   'drag dragend dragenter dragleave dragover dragstart drop',
		GamepadEvent:                'gamepadconnected gamepaddisconnected',
		HashChangeEvent:             'hashchange',
		KeyboardEvent:               'keydown keypress keyup',
		ProgressEvent:               'loadend loadstart progress timeout',
		MessageEvent:                'message',
		PageTransitionEvent:         'pagehide pageshow',
		PopStateEvent:               'popstate',
		StorageEvent:                'storage',
		SVGEvent:                    'SVGAbort SVGError SVGLoad SVGResize SVGScroll SVGUnload',
		SVGZoomEvent:                'SVGZoom',
		TouchEvent:                  'touchcancel touchend touchenter touchleave touchmove touchstart',
		TransitionEvent:             'transitionend',
		WheelEvent:                  'wheel'
	};

	var eventGroupByType = {};

	Object.keys( eventTypesByGroup ).forEach( function ( group ) {
		var types = eventTypesByGroup[ group ].split( ' ' );

		types.forEach( function ( t ) {
			eventGroupByType[t] = group;
		});
	});


	// The parameters required by event constructors and init methods, in the order the init methods need them.

	// There is no initKeyboardEvent or initKeyEvent here. Keyboard events are a goddamned mess. You can't fake them
	// well in any browser - the which and keyCode properties are readonly, for example. So we don't actually use the
	// KeyboardEvent constructor, or the initKeyboardEvent or initKeyEvent methods. Instead we use a bog standard
	// Event and add the required parameters as expando properties.

	// TODO I think in some browsers we need to use modifiersList instead of ctrlKey/shiftKey etc?
	var initialiserParams = {
		initUIEvent:          'view detail',
		initMouseEvent:       'view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget',
		initTouchEvent:       'view detail touches targetTouches changedTouches ctrlKey altKey shiftKey metaKey',
		initCompositionEvent: 'view detail data locale',
		initHashChangeEvent:  'oldURL newURL',
		initMessageEvent:     'data origin lastEventId source ports',
		initStorageEvent:     'key oldValue newValue url storageArea',
		initWheelEvent:       'view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget deltaX deltaY deltaZ deltaMode'
	};

	Object.keys( initialiserParams ).forEach( function ( initMethod ) {
		initialiserParams[ initMethod ] = initialiserParams[ initMethod ].split( ' ' );
	});


	var initialisersByGroup = {
		UIEvent:             [ window.UIEvent,             'initUIEvent'          ],
		Event:               [ window.Event,               'initEvent'            ],
		FocusEvent:          [ window.FocusEvent,          'initUIEvent'          ],
		MouseEvent:          [ window.MouseEvent,          'initMouseEvent'       ],
		CompositionEvent:    [ window.CompositionEvent,    'initCompositionEvent' ],
		HashChangeEvent:     [ window.HashChangeEvent,     'initHashChangeEvent'  ],
		KeyboardEvent:       [ window.Event,               'initEvent'            ],
		ProgressEvent:       [ window.ProgressEvent,       'initEvent'            ],
		MessageEvent:        [ window.MessageEvent,        'initMessageEvent'     ], // TODO prefixed?
		PageTransitionEvent: [ window.PageTransitionEvent, 'initEvent'            ],
		PopStateEvent:       [ window.PopStateEvent,       'initEvent'            ],
		StorageEvent:        [ window.StorageEvent,        'initStorageEvent'     ],
		TouchEvent:          [ window.TouchEvent,          'initTouchEvent'       ],
		WheelEvent:          [ window.WheelEvent,          'initWheelEvent'       ] // TODO this differs between browsers...
	};

	var keyboardParams = [ 'altKey', 'charCode', 'code', 'ctrlKey', 'isComposing', 'key', 'keyCode', 'keyIdentifier', 'location', 'metaKey', 'repeat', 'shiftKey', 'which' ];

	function extendWithKeyboardParams ( event, params ) {
		if ( params === void 0 ) params = {};

		var i = keyboardParams.length;
		while ( i-- ) {
			event[ keyboardParams[i] ] = params[ keyboardParams[i] ];
		}
	}

	function ancient () {
		function makeInitialiser ( methodName, paramsList ) {
			return function ( event, type, params ) {
				event.type = type;

				var i = paramsList.length;
				while ( i-- ) {
					var paramName = paramsList[i];
					event[ paramName ] = params[ paramName ] || defaults[ paramName ];
				}
			};
		}

		var initialisers = {};
		var methodName;

		for ( methodName in initialiserParams ) {
			if ( initialiserParams.hasOwnProperty( methodName ) ) {
				initialisers[ methodName ] = makeInitialiser( methodName, initialiserParams[ methodName ] );
			}
		}

		initialisers.initEvent = makeInitialiser( 'initEvent', [] );

		function simulant ( type, params ) {
			var group = eventGroupByType[ type ];
			var isKeyboardEvent;

			if ( group === 'KeyboardEvent' ) {
				isKeyboardEvent = true;
				group = 'Event';
			}

			var initialiserName = initialisersByGroup[ group ][1];
			var initialise = initialisers[ initialiserName ];

			var event = document.createEventObject();
			initialise( event, type, params || {} );

			if ( isKeyboardEvent ) {
				extendWithKeyboardParams( event, params );
			}

			return event;
		}

		simulant.mode = 'ancient';
		return simulant;
	}

	function legacy () {
		function makeInitialiser ( methodName, paramsList ) {
			return function ( event, type, params ) {
				var args;

				// first three args are always `type`, `bubbles`, `cancelable`
				args = [ type, true, true ]; // TODO some events don't bubble?

				paramsList.forEach( function ( paramName ) {
					args.push( params[ paramName ] || defaults[ paramName ] );
				});

				event[ methodName ].apply( event, args );
			};
		}

		var initialisers = {};

		Object.keys( initialiserParams ).forEach( function ( methodName ) {
			initialisers[ methodName ] = makeInitialiser( methodName, initialiserParams[ methodName ] );
		});

		initialisers.initEvent = makeInitialiser( 'initEvent', [] );

		function simulant ( type, params ) {
			var event, group, initialiserName, initialise, isKeyboardEvent;

			group = eventGroupByType[ type ];

			if ( group === 'KeyboardEvent' ) {
				isKeyboardEvent = true;
				group = 'Event';
			}

			initialiserName = initialisersByGroup[ group ][1];
			initialise = initialisers[ initialiserName ];

			event = document.createEvent( group );
			initialise( event, type, params || {} );

			if ( isKeyboardEvent ) {
				extendWithKeyboardParams( event, params );
			}

			return event;
		}

		simulant.mode = 'legacy';
		return simulant;
	}

	function modern () {
		function simulant ( type, params ) {
			if ( params === void 0 ) params = {};

			var group = eventGroupByType[ type ];
			var isKeyboardEvent;

			if ( group === 'KeyboardEvent' ) {
				group = 'Event'; // because you can't fake KeyboardEvents well in any browser
				isKeyboardEvent = true;
			}

			var initialiser = ( initialisersByGroup[ group ] || initialisersByGroup.Event );

			var Constructor = initialiser[0] || window.Event;
			var method = initialiser[1];

			var extendedParams = {
				bubbles: true, // TODO some events don't bubble?
				cancelable: true
			};

			var paramsList = initialiserParams[ method ];
			var i = ( paramsList ? paramsList.length : 0 );

			while ( i-- ) {
				var paramName = paramsList[i];
				extendedParams[ paramName ] = ( paramName in params ? params[ paramName ] : defaults[ paramName ] );
			}

			var event = new Constructor( type, extendedParams );

			if ( isKeyboardEvent ) {
				extendWithKeyboardParams( event, params );
			}

			return event;
		}

		simulant.mode = 'modern';
		return simulant;
	}

	function polyfill () {
		// https://gist.github.com/Rich-Harris/6010282 via https://gist.github.com/jonathantneal/2869388
		// addEventListener polyfill IE6+
		var Event, addEventListener, removeEventListener, head, style;

		Event = function ( e, element ) {
			var property, instance = this;

			for ( property in e ) {
				instance[ property ] = e[ property ];
			}

			instance.currentTarget =  element;
			instance.target = e.srcElement || element;
			instance.timeStamp = +new Date();

			instance.preventDefault = function () {
				e.returnValue = false;
			};

			instance.stopPropagation = function () {
				e.cancelBubble = true;
			};
		};

		addEventListener = function ( type, listener ) {
			var element = this, listeners, i;

			listeners = element.listeners || ( element.listeners = [] );
			i = listeners.length;

			listeners[i] = [ listener, function (e) {
				listener.call( element, new Event( e, element ) );
			}];

			element.attachEvent( 'on' + type, listeners[i][1] );
		};

		removeEventListener = function ( type, listener ) {
			var element = this, listeners, i;

			if ( !element.listeners ) {
				return;
			}

			listeners = element.listeners;
			i = listeners.length;

			while ( i-- ) {
				if ( listeners[i][0] === listener ) {
					element.detachEvent( 'on' + type, listeners[i][1] );
				}
			}
		};

		window.addEventListener = document.addEventListener = addEventListener;
		window.removeEventListener = document.removeEventListener = removeEventListener;

		if ( 'Element' in window ) {
			Element.prototype.addEventListener = addEventListener;
			Element.prototype.removeEventListener = removeEventListener;
		} else {
			head = document.getElementsByTagName('head')[0];
			style = document.createElement('style');

			head.insertBefore( style, head.firstChild );

			style.styleSheet.cssText = '*{-ms-event-prototype:expression(!this.addEventListener&&(this.addEventListener=addEventListener)&&(this.removeEventListener=removeEventListener))}';
		}

		addEventListener.simulant = true;
	}

	var simulant;

	try {
		new MouseEvent( 'click' );
		simulant = modern();
	} catch ( err ) {
		if ( !document.createEvent ) {
			if ( document.createEventObject ) {
				simulant = ancient();
			} else {
				throw new Error( 'Events cannot be created in this browser' );
			}
		} else {
			simulant = legacy();
		}
	}

	if ( document.dispatchEvent ) {
		simulant.fire = function ( node, event, params ) {
			if ( typeof event === 'string' ) {
				event = simulant( event, params );
			}

			node.dispatchEvent( event );
			return event;
		};
	} else if ( document.fireEvent ) {
		simulant.fire = function ( node, event, params ) {
			if ( typeof event === 'string' ) {
				event = simulant( event, params );
			}

			node.fireEvent( 'on' + event.type, event );

			// Special case - checkbox inputs
			if ( node.tagName === 'INPUT' && node.type === 'checkbox' ) {
				node.click();
			}
			return event;
		};
	}

	simulant.polyfill = polyfill;

	var simulant$1 = simulant;

	return simulant$1;

}));

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global google */

var _awesomplete = require('awesomplete');

var _awesomplete2 = _interopRequireDefault(_awesomplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutocompleteGoogle = function () {
    function AutocompleteGoogle() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, AutocompleteGoogle);

        this.options = options;
        this.content = options.content || {
            streetNumber: {},
            streetName: {},
            suburb: {},
            state: {},
            postcode: {},
            autocompleteGoogle: {}
        };
        this.service = new google.maps.places.AutocompleteService();
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        this.elements = {};
        this.fields = {
            streetNumber: true,
            streetName: true,
            suburb: true,
            state: true,
            postcode: true
        };

        //configure plugin

        this.options.suburbsPlaceHolder = options.suburbsPlaceHolder || 'Please select';

        if (this.options.suburbs) {
            this.options.suburbs.unshift({
                label: this.options.suburbsPlaceHolder,
                value: null
            });
        }

        Object.assign(this.fields, this.options.fields);
        this.options.formShow = options.formShow || 'autocomplete';

        //create the forme elements

        this._generateElements();

        // create the form

        this.addressForm = this._generateElements();
        document.querySelector(this.options.parent).appendChild(this.addressForm);

        //get the indivual elements

        this.elements = {
            manualForm: this.addressForm.querySelector('[data-manual-form]'),
            autocompleteForm: this.addressForm.querySelector('[data-autocomplete-form]'),
            formToggle: this.addressForm.querySelector('[data-form-toggle]'),
            autoCompleteInput: this.addressForm.querySelector('[data-autocomplete-input]')
        };

        this.elements.inputs = this.addressForm.querySelectorAll('input, select');
        this.elements.manualInputs = this.addressForm.querySelectorAll('input, select');

        this.currentForm = this.options.formShow;
        this._addEvents();
        this._cleanForm();
    }

    _createClass(AutocompleteGoogle, [{
        key: '_utils',
        value: function _utils() {

            return {

                /**
                * Remove all special characters and spaces from a string
                * @param {string} string - The string to clean
                */

                cleanString: function cleanString(string) {
                    string = string.toLowerCase();
                    return string.replace(/[^A-Z0-9]/ig, '');
                },


                /**
                * Removes an element and returns it
                * @param {element} element - The element to remove
                */

                removeElement: function removeElement(element) {
                    element.parentNode.removeChild(element);
                    return element;
                },


                /**
                * Converts array like item to an array
                * @param {object} obj - The object to convert
                */

                toArray: function toArray(obj) {

                    var array = [];

                    for (var i = 0; i < obj.length; i++) {
                        array[i] = obj[i];
                    }

                    return array;
                },


                /**
                * Delegates an event to a child element
                * @param {string} parent - A css selector of the parent element
                * @param {string} target - A css selector of the target element
                * @param {string} type - The type of event
                * @param {function} code - The function to execute if a target is clicked
                */

                delegate: function delegate(parent, target, type, code) {
                    var _this = this;

                    document.querySelector(parent).addEventListener(type, function (e) {

                        var targets = _this.toArray(document.querySelectorAll(target));

                        if (targets.indexOf(e.target) > -1) {
                            if (code) code(e);
                        }
                    }, type === 'blur' || type === 'focus');
                },


                /**
                * Delegates an event to a child element
                * @param {element} element - The element whose ancestor you want.
                * @param {string} ancestor - A css selector of the ancestor element you want to target
                */

                getAncestor: function getAncestor(element, ancestor) {

                    var current = element;
                    var chosen = null;

                    while (current.parentNode.constructor !== document.constructor || chosen === null) {
                        current = current.parentNode;

                        if (current.matches(ancestor)) {
                            chosen = current;
                        }
                    }

                    return chosen;
                }
            };
        }
    }, {
        key: 'cleanUp',
        value: function cleanUp() {

            if (this.addressForm) {
                this.addressForm.parentNode.removeChild(this.addressForm);
            } else {
                console.warn('Nothing in page to clean up');
            }
        }
    }, {
        key: 'validate',
        value: function validate(element) {
            var _this2 = this;

            this.isValid = false;

            var renderView = function renderView(ele, condition) {

                ele = _this2._utils().getAncestor(ele, '.input-wrapper');

                //add class to input field
                if (condition) {
                    ele.setAttribute('data-is-valid', true);
                    ele.classList.remove('stop');
                    ele.classList.add('go');
                } else {
                    ele.setAttribute('data-is-valid', false);
                    ele.classList.remove('go');
                    ele.classList.add('stop');
                }
            };

            var valCheck = function valCheck(val) {

                var valid = !(val === null || val === '' || val === 'null' || val === undefined);

                return valid;
            };

            if (this.currentForm === 'autocomplete') {

                this.isValid = this.placeChosen !== null;
                renderView(this.elements.autoCompleteInput, this.isValid);
            } else if (this.currentForm === 'manual') {
                (function () {

                    var elementIsValid = function elementIsValid(ele, item) {

                        var valCheckResult = valCheck(_this2.result[item]);

                        if (ele.tagName === 'SELECT') {
                            return ele.children[0].value !== ele.value && valCheckResult;
                        }

                        return valCheck(ele.value) && valCheckResult;
                    };

                    // Configure individual element
                    if (element) {
                        var googleKey = element.getAttribute('data-google-places-key');
                        var valid = elementIsValid(element, googleKey);
                        renderView(element, valid);
                    }

                    //Check the entire form for validity
                    var isValid = Object.keys(_this2.result).map(function (item) {
                        var ele = _this2.elements.manualForm.querySelector('[data-google-places-key="' + item + '"]');
                        return elementIsValid(ele, item);
                    });

                    if (isValid.indexOf(false) === -1) {
                        _this2.isValid = true;
                    }
                })();
            }

            return this.isValid;
        }
    }, {
        key: '_cleanForm',
        value: function _cleanForm() {
            var _this3 = this;

            this.result = {};
            this.isValid = null;
            this.placeChosen = null;

            if (this.currentForm === 'manual') {

                this.elements.manualInputs.forEach(function (item) {
                    item.value = '';
                    item.setAttribute('value', '');
                    _this3.result[item.getAttribute('data-google-places-key')] = null;
                });

                if (this.options.suburbs) {
                    this.result.locality = this.options.suburbs[0].value;
                }
            }
        }
    }, {
        key: '_cleanAutoComplete',
        value: function _cleanAutoComplete() {
            this.result = {};
            this.isValid = null;
            this.placeChosen = null;
            this.elements.autoCompleteInput.value = '';
            this.elements.autoCompleteInput.setAttribute('value', '');
        }
    }, {
        key: '_getResult',
        value: function _getResult(input, onResult) {

            if (location.hostname === 'localhost') {
                onResult([{
                    description: '126 Princes Highway, Bolwarra, Victoria, Australia',
                    id: 'f3ba2d2b971163fc9f3de716d1232f9386d0cc3b',
                    matched_substrings: [{
                        length: 2,
                        offset: 0
                    }],
                    place_id: 'ChIJ57-9r9-QnaoRZzzxfcRRHew',
                    reference: 'ClRKAAAAwIG0qank1q8kRkxGydb4RcCQD6MchOWjOamYLRvNmiQnzFmFMntn_K4iC-hsKmHwl46GcFbs4Ck6Tz8Isd9VDg0TvX7Kxf9B1NTPvR2RwiISEEElzX-M03xToF38WrGve2YaFMXoC_U3_maC12ElKtzTSD_TqbA8',
                    structured_formatting: {
                        main_text: '126 Princes Highway',
                        main_text_matched_substrings: [{
                            length: 2,
                            offset: 0
                        }],
                        secondary_text: 'Bolwarra, Victoria, Australia'
                    },
                    terms: [{
                        offset: 0,
                        value: '126'
                    }, {
                        offset: 4,
                        value: 'Princes Highway'
                    }, {
                        offset: 21,
                        value: 'Bolwarra'
                    }, {
                        offset: 31,
                        value: 'Victoria'
                    }, {
                        offset: 41,
                        value: 'Australia'
                    }],
                    types: ['street_address', 'geocode']
                }]);
            } else {
                this.service.getPlacePredictions({
                    input: input,
                    componentRestrictions: { country: 'au' },
                    types: ['address']
                }, function (predictions, status) {

                    if (status === google.maps.places.PlacesServiceStatus.OK || status !== 'ZERO_RESULTS') {
                        onResult(predictions);
                    }
                });
            }
        }
    }, {
        key: '_generateElements',
        value: function _generateElements() {
            var _this4 = this;

            var content = {
                formToggle: this.content.formToggle || "Can't find your address?",
                streetNumber: {
                    error: this.content.streetNumber.error || 'Please enter a street number.',
                    label: this.content.streetNumber.label || 'Street Number',
                    placeholder: this.content.streetNumber.placeholder || 'Street Number'
                },
                streetName: {
                    error: this.content.streetName.error || 'Please enter a street name.',
                    label: this.content.streetName.label || 'Street Name',
                    placeholder: this.content.streetName.placeholder || 'Street Name'
                },
                suburb: {
                    error: this.content.suburb.error || 'Please choose a suburb.',
                    label: this.content.suburb.label || 'Suburb',
                    placeholder: this.content.suburb.placeholder || 'Suburb'
                },
                state: {
                    error: this.content.state.error || 'Please enter a state.',
                    label: this.content.state.label || 'State',
                    placeholder: this.content.state.placeholder || 'State'
                },
                postcode: {
                    error: this.content.postcode.error || 'Please enter a postcode.',
                    label: this.content.postcode.label || 'Postcode',
                    placeholder: this.content.postcode.placeholder || 'Postcode'
                },
                autocompleteGoogle: {
                    error: this.content.autocompleteGoogle.error || 'Please select an option from the dropdown.',
                    label: this.content.autocompleteGoogle.label || 'Address',
                    placeholder: this.content.autocompleteGoogle.placeholder || 'Address'
                }
            };

            var getSuburbInput = function getSuburbInput() {

                var suburbInput = void 0;

                if (_this4.options.suburbs) {

                    suburbInput = '<select data-google-places-key="locality" id="autocomplete-suburb" name="autocomplete-suburb" data-is-valid="false">';

                    _this4.options.suburbs.forEach(function (item) {
                        suburbInput += '<option value="' + item.value + '">' + item.label + '</option>';
                    });

                    suburbInput += '</select>';
                } else {

                    suburbInput = '<input type="text" placeholder="' + content.suburb.placeholder + '" data-google-places-key="locality" id="autocomplete-suburb" name="autocomplete-suburb" data-is-valid="false"/></span>';
                }

                return suburbInput;
            };

            var streetNumber = {
                true: '<div>\n                    <label class="autocomplete-label" for="autocomplete-street-number">' + content.streetNumber.label + '</label>\n                    <div class="input-wrapper">\n                        <span>\n                        <input type="text" placeholder="' + content.streetNumber.placeholder + '" data-google-places-key="street_number" id="autocomplete-street-number" name="autocomplete-street-number" data-is-valid="false"/></span>\n                         <p class="label-text">' + content.streetNumber.error + '</p>\n                     </div>\n                </div>',
                false: ''
            };

            var streetName = {
                true: '<div>\n                <label class="autocomplete-label" for="autocomplete-street-name">' + content.streetName.label + '</label>\n                <div class="input-wrapper">\n                    <span><input type="text" placeholder="' + content.streetName.placeholder + '" data-google-places-key="route" id="autocomplete-street-name" name="autocomplete-street-name" data-is-valid="false"/></span>\n                     <p class="label-text">' + content.streetName.error + '</p>\n                 </div>\n            </div>',
                false: ''
            };

            var suburb = {
                true: '<div>\n                <label class="autocomplete-label" for="autocomplete-suburb">' + content.suburb.label + '</label>\n                <div class="input-wrapper">\n                    <span>' + getSuburbInput() + '</span>\n                    <p class="label-text">' + content.suburb.error + '</p>\n                </div>\n            </div>',
                false: ''
            };

            var state = {
                true: '<div>\n                <label class="autocomplete-label" for="autocomplete-state">' + content.state.label + '</label>\n                <div class="input-wrapper">\n                    <span><select placeholder="' + content.state.placeholder + '" data-google-places-key="administrative_area_level_1" id="autocomplete-state" name="autocomplete-state" data-is-valid="false"/></span>\n                    <p class="label-text">' + content.state.error + '</p>\n                </div>\n            </div>',
                false: ''
            };

            var postcode = {
                true: '<div>\n                    <label class="autocomplete-label" for="autocomplete-postcode">' + content.postcode.label + '</label>\n                    <div class="input-wrapper">\n                        <span><input type="number" placeholder="' + content.postcode.placeholder + '" data-google-places-key="postal_code" id="autocomplete-postcode" name="autocomplete-postcode" data-is-valid="false"/></span>\n                        <p class="label-text">' + content.postcode.error + '</p>\n                    </div>\n                </div>\n            </div>',
                false: ''
            };

            var parser = new DOMParser();

            var string = '\n            <div class="autocomplete-wrapper" data-autocomplete-wrapper>\n                <div class="autocomplete-form" data-autocomplete-form>\n                    <label class="autocomplete-label" for="autocomplete-google">' + content.autocompleteGoogle.label + '</label>\n                    <div class="input-wrapper">\n                        <span><input type="text" placeholder="' + content.autocompleteGoogle.placeholder + '" data-autocomplete-input id="autocomplete-google" name="autocomplete-google" data-is-valid="false"/></span>\n                         <p class="label-text">' + content.autocompleteGoogle.error + '</p>\n                     </div>\n                     <p><a href="#" data-form-toggle>' + content.formToggle + '</a></p>\n                </div>\n                <div class="manual-form" data-manual-form>\n                    ' + streetNumber[this.fields.streetNumber] + '\n                    ' + streetName[this.fields.streetName] + '\n                    ' + suburb[this.fields.suburb] + '\n                    ' + state[this.fields.state] + '\n                    ' + postcode[this.fields.postcode] + '\n                </div>\n            </div>';

            return parser.parseFromString(string, 'text/html').querySelector('.autocomplete-wrapper');
        }
    }, {
        key: '_addEvents',
        value: function _addEvents() {
            var _this5 = this;

            this.awesomplete = new _awesomplete2.default(this.elements.autoCompleteInput, {
                replace: function replace(item) {
                    this.input.value = item.label.replace('<br>', ' ');
                }
            });

            var switchForms = function switchForms(e) {
                e.preventDefault();
                _this5._cleanForm();
                if (_this5.currentForm === 'autocomplete') _this5.currentForm = 'manual';else if (_this5.currentForm === 'manual') _this5.currentForm = 'autocomplete';
            };

            var resetResult = function resetResult() {
                _this5.result = {};
                _this5.placeChosen = true;
                _this5.elements.autoCompleteInput.removeEventListener('keyup', resetResult);
            };

            var getDropDownResults = function getDropDownResults(e) {

                var checkKeyCode = function checkKeyCode(keycode) {
                    return [keycode === 13, keycode === 27, keycode === 38, keycode === 40].indexOf(true) === -1;
                };

                if (checkKeyCode(e.keyCode)) {
                    (function () {

                        var inputValue = _this5.elements.autoCompleteInput.value;

                        var splitAt = function splitAt(index, it) {
                            return [it.slice(0, index), it.slice(index).replace(', ', '').replace(', Australia', '')];
                        };

                        if (inputValue) {

                            _this5._getResult(inputValue, function (result) {

                                _this5._cleanForm();
                                _this5.awesomplete.list = result.map(function (item) {

                                    var formattedResult = splitAt(item.description.indexOf(','), item.description);
                                    return { value: item.place_id, label: formattedResult[0] + '<br>' + formattedResult[1] };
                                });

                                if (typeof _this5.options.resultsUpdated === 'function') {
                                    _this5.options.resultsUpdated(_this5.awesomplete.list);
                                }
                            });
                        }
                    })();
                }
            };

            var chooseResult = function chooseResult(e) {

                var callback = function callback(place, status) {

                    if (status === 'OK') {

                        _this5.result = {};
                        _this5.placeChosen = true;
                        place.address_components.forEach(function (item) {
                            _this5.result[item.types[0]] = item.short_name;
                        });
                        _this5.validate();
                    } else {
                        throw new Error('Place service request returned error: ' + status);
                    }

                    //callback
                    if (typeof _this5.options.placeSelected === 'function') {
                        _this5.options.placeSelected(_this5.result);
                    }
                };

                if (location.hostname === 'localhost') {
                    callback({
                        address_components: [{
                            long_name: '126',
                            short_name: '126',
                            types: ['street_number']
                        }, {
                            long_name: 'Princes Highway',
                            short_name: 'Princes Hwy',
                            types: ['route']
                        }, {
                            long_name: 'Bolwarra',
                            short_name: 'Bolwarra',
                            types: ['locality', 'political']
                        }, {
                            long_name: 'Glenelg Shire',
                            short_name: 'Glenelg',
                            types: ['administrative_area_level_2', 'political']
                        }, {
                            long_name: 'Victoria',
                            short_name: 'VIC',
                            types: ['administrative_area_level_1', 'political']
                        }, {
                            long_name: 'Australia',
                            short_name: 'AU',
                            types: ['country', 'political']
                        }, {
                            long_name: '3305',
                            short_name: '3305',
                            types: ['postal_code']
                        }],
                        adr_address: '<span class="street-address">126 Princes Hwy</span>, <span class="locality">Bolwarra</span> <span class="region">VIC</span> <span class="postal-code">3305</span>, <span class="country-name">Australia</span>',
                        formatted_address: '126 Princes Hwy, Bolwarra VIC 3305, Australia',
                        geometry: {
                            location: {
                                lat: -38.2911794,
                                lng: 141.6087061
                            },
                            viewport: {
                                northeast: {
                                    lat: -38.2908923,
                                    lng: 141.60889155
                                },
                                southwest: {
                                    lat: -38.2912751,
                                    lng: 141.60814975
                                }
                            }
                        },
                        icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
                        id: 'f3ba2d2b971163fc9f3de716d1232f9386d0cc3b',
                        name: '126 Princes Hwy',
                        place_id: 'ChIJ57-9r9-QnaoRZzzxfcRRHew',
                        reference: 'CmRbAAAAljNnvRrFOL1qBBWcKq7No3_qQwimcTHrBQud9GPjDx5ycgQk31RrndZlUX7JUx5BNldG9COlCOxsFOUWGbYp6PuMthBfiUCH2hg3Uq1bj1wFlNeBuLwUzmNZKUrM4NDTEhDbDnkkWuHCfHt5m5hrNgI0GhQ1SisXvVIvWy-yszulPV9coo7unQ',
                        scope: 'GOOGLE',
                        types: ['street_address'],
                        url: 'https://maps.google.com/?q=126+Princes+Hwy,+Bolwarra+VIC+3305,+Australia&ftid=0xaa9d90dfafbdbfe7:0xec1d51c47df13c67',
                        utc_offset: 660,
                        vicinity: 'Bolwarra'
                    }, 'OK');
                } else {
                    _this5.placesService.getDetails({ placeId: e.text.value }, callback);
                }
            };

            var updateManualInput = function updateManualInput(e) {
                var key = e.target.getAttribute('data-google-places-key');
                _this5.result[key] = e.target.value;
            };

            var validate = function validate(e) {
                _this5.validate(e.target);
                _this5.validate();
            };

            var emptyResult = function emptyResult() {
                _this5._cleanAutoComplete();
            };

            this.elements.formToggle.addEventListener('click', switchForms);
            this.elements.autoCompleteInput.addEventListener('keyup', resetResult);
            this.elements.autoCompleteInput.addEventListener('keyup', getDropDownResults);
            this.elements.autoCompleteInput.addEventListener('focus', emptyResult);

            this._utils().delegate('[data-autocomplete-wrapper]', 'input, select', 'blur', validate);

            this._utils().delegate('[data-autocomplete-wrapper]', 'select', 'change', function (e) {
                updateManualInput(e);
                validate(e);
            });

            this._utils().delegate('[data-manual-form]', 'input', 'keyup', updateManualInput);

            document.addEventListener('awesomplete-selectcomplete', function (e) {
                chooseResult(e);
            });
        }
    }, {
        key: 'currentForm',
        get: function get() {
            return this.options.formShow;
        },
        set: function set(val) {

            if (val === 'autocomplete' || val === 'manual') {

                this.options.formShow = val;

                if (val === 'autocomplete') {
                    this.elements.manualForm.style.display = 'none';
                    this.elements.autocompleteForm.style.display = 'block';
                } else {
                    this.elements.manualForm.style.display = 'block';
                    this.elements.autocompleteForm.style.display = 'none';
                }
            } else {
                console.warn('currentForm can only be set to "autocomplete" or "manual"');
            }
        }
    }]);

    return AutocompleteGoogle;
}();

exports.default = AutocompleteGoogle;

},{"awesomplete":2}]},{},[1])(1)
});
//# sourceMappingURL=address-autcomplete.test.js.map
