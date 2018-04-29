"use strict";
/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var platform_1 = require("../platform/platform");
var api_1 = require("../util/api");
var error_1 = require("../util/error");
var input_validation_1 = require("../util/input_validation");
var misc_1 = require("../util/misc");
/** Helper function to assert Uint8Array is available at runtime. */
function assertUint8ArrayAvailable() {
    if (typeof Uint8Array === 'undefined') {
        throw new error_1.FirestoreError(error_1.Code.UNIMPLEMENTED, 'Uint8Arrays are not available in this environment.');
    }
}
/** Helper function to assert Base64 functions are available at runtime. */
function assertBase64Available() {
    if (!platform_1.PlatformSupport.getPlatform().base64Available) {
        throw new error_1.FirestoreError(error_1.Code.UNIMPLEMENTED, 'Blobs are unavailable in Firestore in this environment.');
    }
}
/**
 * Immutable class holding a blob (binary data).
 * This class is directly exposed in the public API.
 *
 * Note that while you can't hide the constructor in JavaScript code, we are
 * using the hack above to make sure no-one outside this module can call it.
 */
var Blob = /** @class */ (function () {
    function Blob(binaryString) {
        assertBase64Available();
        this._binaryString = binaryString;
    }
    Blob.fromBase64String = function (base64) {
        input_validation_1.validateExactNumberOfArgs('Blob.fromBase64String', arguments, 1);
        input_validation_1.validateArgType('Blob.fromBase64String', 'string', 1, base64);
        assertBase64Available();
        try {
            var binaryString = platform_1.PlatformSupport.getPlatform().atob(base64);
            return new Blob(binaryString);
        }
        catch (e) {
            throw new error_1.FirestoreError(error_1.Code.INVALID_ARGUMENT, 'Failed to construct Blob from Base64 string: ' + e);
        }
    };
    Blob.fromUint8Array = function (array) {
        input_validation_1.validateExactNumberOfArgs('Blob.fromUint8Array', arguments, 1);
        assertUint8ArrayAvailable();
        if (!(array instanceof Uint8Array)) {
            throw input_validation_1.invalidClassError('Blob.fromUint8Array', 'Uint8Array', 1, array);
        }
        // We can't call array.map directly because it expects the return type to
        // be a Uint8Array, whereas we can convert it to a regular array by invoking
        // map on the Array prototype.
        var binaryString = Array.prototype.map
            .call(array, function (char) {
            return String.fromCharCode(char);
        })
            .join('');
        return new Blob(binaryString);
    };
    Blob.prototype.toBase64 = function () {
        input_validation_1.validateExactNumberOfArgs('Blob.toBase64', arguments, 0);
        assertBase64Available();
        return platform_1.PlatformSupport.getPlatform().btoa(this._binaryString);
    };
    Blob.prototype.toUint8Array = function () {
        input_validation_1.validateExactNumberOfArgs('Blob.toUint8Array', arguments, 0);
        assertUint8ArrayAvailable();
        var buffer = new Uint8Array(this._binaryString.length);
        for (var i = 0; i < this._binaryString.length; i++) {
            buffer[i] = this._binaryString.charCodeAt(i);
        }
        return buffer;
    };
    Blob.prototype.toString = function () {
        return 'Blob(base64: ' + this.toBase64() + ')';
    };
    Blob.prototype.isEqual = function (other) {
        return this._binaryString === other._binaryString;
    };
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */
    Blob.prototype._compareTo = function (other) {
        return misc_1.primitiveComparator(this._binaryString, other._binaryString);
    };
    return Blob;
}());
exports.Blob = Blob;
// Public instance that disallows construction at runtime. This constructor is
// used when exporting Blob on firebase.firestore.Blob and will be called Blob
// publicly. Internally we still use Blob which has a type checked private
// constructor. Note that Blob and PublicBlob can be used interchangeably in
// instanceof checks.
// For our internal TypeScript code PublicBlob doesn't exist as a type, and so
// we need to use Blob as type and export it too.
// tslint:disable-next-line:variable-name We're treating this as a class name.
exports.PublicBlob = api_1.makeConstructorPrivate(Blob, 'Use Blob.fromUint8Array() or Blob.fromBase64String() instead.');

//# sourceMappingURL=blob.js.map
