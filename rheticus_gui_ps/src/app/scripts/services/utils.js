'use strict';

/**
 * Cross-Browser String prototypes for rheticus project
 */

//For IE :: creating "startsWith" and "splice" methods for String Class - START
if (typeof String.prototype.startsWith !== "function") {
	String.prototype.startsWith = function (str) {
		return this.slice(0, str.length) === str;
	};
}
if (typeof String.prototype.splice !== "function") {
	String.prototype.splice = function (idx, rem, s) {
		return this.slice(0, idx) + s + this.slice(idx + Math.abs(rem));
	};
}
//For IE :: creating "startsWith" and "splice" methods for String Class - END
