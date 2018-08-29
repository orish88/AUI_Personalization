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
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var controller_interface_1 = require("./controller-interface");
var errors_1 = require("../models/errors");
var worker_page_message_1 = require("../models/worker-page-message");
var default_sw_1 = require("../models/default-sw");
var notification_permission_1 = require("../models/notification-permission");
var fcm_details_1 = require("../models/fcm-details");
var base64_to_array_buffer_1 = require("../helpers/base64-to-array-buffer");
var util_1 = require("@firebase/util");
var WindowController = /** @class */ (function (_super) {
    tslib_1.__extends(WindowController, _super);
    /**
     * A service that provides a MessagingService instance.
     * @param {!firebase.app.App} app
     */
    function WindowController(app) {
        var _this = _super.call(this, app) || this;
        _this.messageObserver_ = null;
        _this.onMessage_ = util_1.createSubscribe(function (observer) {
            _this.messageObserver_ = observer;
        });
        _this.tokenRefreshObserver_ = null;
        _this.onTokenRefresh_ = util_1.createSubscribe(function (observer) {
            _this.tokenRefreshObserver_ = observer;
        });
        /**
         * @private
         * @type {ServiceWorkerRegistration}
         */
        _this.registrationToUse_;
        /**
         * @private
         * @type {Promise}
         */
        _this.manifestCheckPromise_;
        /**
         * @private
         * @type {firebase.Observer}
         */
        _this.messageObserver_ = null;
        /**
         * @private {!firebase.Subscribe} The subscribe function to the onMessage
         * observer.
         */
        _this.onMessage_ = util_1.createSubscribe(function (observer) {
            _this.messageObserver_ = observer;
        });
        /**
         * @private
         * @type {firebase.Observer}
         */
        _this.tokenRefreshObserver_ = null;
        _this.onTokenRefresh_ = util_1.createSubscribe(function (observer) {
            _this.tokenRefreshObserver_ = observer;
        });
        _this.setupSWMessageListener_();
        return _this;
    }
    /**
     * This method returns an FCM token if it can be generated.
     * The return promise will reject if the browser doesn't support
     * FCM, if permission is denied for notifications or it's not
     * possible to generate a token.
     * @export
     * @return {Promise<string> | Promise<null>} Returns a promise the
     * resolves to an FCM token or null if permission isn't granted.
     */
    WindowController.prototype.getToken = function () {
        var _this = this;
        // Check that the required API's are available
        if (!this.isSupported_()) {
            return Promise.reject(this.errorFactory_.create(errors_1.default.codes.UNSUPPORTED_BROWSER));
        }
        return this.manifestCheck_().then(function () {
            return _super.prototype.getToken.call(_this);
        });
    };
    /**
     * The method checks that a manifest is defined and has the correct GCM
     * sender ID.
     * @private
     * @return {Promise} Returns a promise that resolves if the manifest matches
     * our required sender ID
     */
    WindowController.prototype.manifestCheck_ = function () {
        var _this = this;
        if (this.manifestCheckPromise_) {
            return this.manifestCheckPromise_;
        }
        var manifestTag = document.querySelector('link[rel="manifest"]');
        if (!manifestTag) {
            this.manifestCheckPromise_ = Promise.resolve();
        }
        else {
            this.manifestCheckPromise_ = fetch(manifestTag.href)
                .then(function (response) {
                return response.json();
            })
                .catch(function () {
                // If the download or parsing fails allow check.
                // We only want to error if we KNOW that the gcm_sender_id is incorrect.
            })
                .then(function (manifestContent) {
                if (!manifestContent) {
                    return;
                }
                if (!manifestContent['gcm_sender_id']) {
                    return;
                }
                if (manifestContent['gcm_sender_id'] !== '103953800507') {
                    throw _this.errorFactory_.create(errors_1.default.codes.INCORRECT_GCM_SENDER_ID);
                }
            });
        }
        return this.manifestCheckPromise_;
    };
    /**
     * Request permission if it is not currently granted
     * @export
     * @returns {Promise} Resolves if the permission was granted, otherwise
     * rejects
     */
    WindowController.prototype.requestPermission = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (Notification.permission === notification_permission_1.default.granted) {
                    return [2 /*return*/];
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var managePermissionResult = function (result) {
                            if (result === notification_permission_1.default.granted) {
                                return resolve();
                            }
                            else if (result === notification_permission_1.default.denied) {
                                return reject(_this.errorFactory_.create(errors_1.default.codes.PERMISSION_BLOCKED));
                            }
                            else {
                                return reject(_this.errorFactory_.create(errors_1.default.codes.PERMISSION_DEFAULT));
                            }
                        };
                        // The Notification.requestPermission API was changed to
                        // return a promise so now have to handle both in case
                        // browsers stop support callbacks for promised version
                        var permissionPromise = Notification.requestPermission(managePermissionResult);
                        if (permissionPromise) {
                            // Prefer the promise version as it's the future API.
                            permissionPromise.then(managePermissionResult);
                        }
                    })];
            });
        });
    };
    /**
     * This method allows a developer to override the default service worker and
     * instead use a custom service worker.
     * @export
     * @param {!ServiceWorkerRegistration} registration The service worker
     * registration that should be used to receive the push messages.
     */
    WindowController.prototype.useServiceWorker = function (registration) {
        if (!(registration instanceof ServiceWorkerRegistration)) {
            throw this.errorFactory_.create(errors_1.default.codes.SW_REGISTRATION_EXPECTED);
        }
        if (typeof this.registrationToUse_ !== 'undefined') {
            throw this.errorFactory_.create(errors_1.default.codes.USE_SW_BEFORE_GET_TOKEN);
        }
        this.registrationToUse_ = registration;
    };
    /**
     * This method allows a developer to override the default vapid key
     * and instead use a custom VAPID public key.
     * @export
     * @param {!string} publicKey A URL safe base64 encoded string.
     */
    WindowController.prototype.usePublicVapidKey = function (publicKey) {
        if (typeof publicKey !== 'string') {
            throw this.errorFactory_.create(errors_1.default.codes.INVALID_PUBLIC_VAPID_KEY);
        }
        if (typeof this.publicVapidKeyToUse_ !== 'undefined') {
            throw this.errorFactory_.create(errors_1.default.codes.USE_PUBLIC_KEY_BEFORE_GET_TOKEN);
        }
        var parsedKey = base64_to_array_buffer_1.default(publicKey);
        if (parsedKey.length !== 65) {
            throw this.errorFactory_.create(errors_1.default.codes.PUBLIC_KEY_DECRYPTION_FAILED);
        }
        this.publicVapidKeyToUse_ = parsedKey;
    };
    /**
     * @export
     * @param {!firebase.Observer|function(*)} nextOrObserver An observer object
     * or a function triggered on message.
     * @param {function(!Error)=} optError Optional A function triggered on
     * message error.
     * @param {function()=} optCompleted Optional function triggered when the
     * observer is removed.
     * @return {!function()} The unsubscribe function for the observer.
     */
    WindowController.prototype.onMessage = function (nextOrObserver, optError, optCompleted) {
        return this.onMessage_(nextOrObserver, optError, optCompleted);
    };
    /**
     * @export
     * @param {!firebase.Observer|function()} nextOrObserver An observer object
     * or a function triggered on token refresh.
     * @param {function(!Error)=} optError Optional A function
     * triggered on token refresh error.
     * @param {function()=} optCompleted Optional function triggered when the
     * observer is removed.
     * @return {!function()} The unsubscribe function for the observer.
     */
    WindowController.prototype.onTokenRefresh = function (nextOrObserver, optError, optCompleted) {
        return this.onTokenRefresh_(nextOrObserver, optError, optCompleted);
    };
    /**
     * Given a registration, wait for the service worker it relates to
     * become activer
     * @private
     * @param  {ServiceWorkerRegistration} registration Registration to wait
     * for service worker to become active
     * @return {Promise<!ServiceWorkerRegistration>} Wait for service worker
     * registration to become active
     */
    WindowController.prototype.waitForRegistrationToActivate_ = function (registration) {
        var _this = this;
        var serviceWorker = registration.installing || registration.waiting || registration.active;
        return new Promise(function (resolve, reject) {
            if (!serviceWorker) {
                // This is a rare scenario but has occured in firefox
                reject(_this.errorFactory_.create(errors_1.default.codes.NO_SW_IN_REG));
                return;
            }
            // Because the Promise function is called on next tick there is a
            // small chance that the worker became active or redundant already.
            if (serviceWorker.state === 'activated') {
                resolve(registration);
                return;
            }
            if (serviceWorker.state === 'redundant') {
                reject(_this.errorFactory_.create(errors_1.default.codes.SW_REG_REDUNDANT));
                return;
            }
            var stateChangeListener = function () {
                if (serviceWorker.state === 'activated') {
                    resolve(registration);
                }
                else if (serviceWorker.state === 'redundant') {
                    reject(_this.errorFactory_.create(errors_1.default.codes.SW_REG_REDUNDANT));
                }
                else {
                    // Return early and wait to next state change
                    return;
                }
                serviceWorker.removeEventListener('statechange', stateChangeListener);
            };
            serviceWorker.addEventListener('statechange', stateChangeListener);
        });
    };
    /**
     * This will regiater the default service worker and return the registration
     * @private
     * @return {Promise<!ServiceWorkerRegistration>} The service worker
     * registration to be used for the push service.
     */
    WindowController.prototype.getSWRegistration_ = function () {
        var _this = this;
        if (this.registrationToUse_) {
            return this.waitForRegistrationToActivate_(this.registrationToUse_);
        }
        // Make the registration null so we know useServiceWorker will not
        // use a new service worker as registrationToUse_ is no longer undefined
        this.registrationToUse_ = null;
        return navigator.serviceWorker
            .register(default_sw_1.default.path, {
            scope: default_sw_1.default.scope
        })
            .catch(function (err) {
            throw _this.errorFactory_.create(errors_1.default.codes.FAILED_DEFAULT_REGISTRATION, {
                browserErrorMessage: err.message
            });
        })
            .then(function (registration) {
            return _this.waitForRegistrationToActivate_(registration).then(function () {
                _this.registrationToUse_ = registration;
                // We update after activation due to an issue with Firefox v49 where
                // a race condition occassionally causes the service work to not
                // install
                registration.update();
                return registration;
            });
        });
    };
    /**
     * This will return the default VAPID key or the uint8array version of the public VAPID key
     * provided by the developer.
     * @private
     */
    WindowController.prototype.getPublicVapidKey_ = function () {
        if (this.publicVapidKeyToUse_) {
            return Promise.resolve(this.publicVapidKeyToUse_);
        }
        return Promise.resolve(fcm_details_1.default.DEFAULT_PUBLIC_VAPID_KEY);
    };
    /**
     * This method will set up a message listener to handle
     * events from the service worker that should trigger
     * events in the page.
     *
     * @private
     */
    WindowController.prototype.setupSWMessageListener_ = function () {
        var _this = this;
        if (!('serviceWorker' in navigator)) {
            return;
        }
        navigator.serviceWorker.addEventListener('message', function (event) {
            if (!event.data || !event.data[worker_page_message_1.default.PARAMS.TYPE_OF_MSG]) {
                // Not a message from FCM
                return;
            }
            var workerPageMessage = event.data;
            switch (workerPageMessage[worker_page_message_1.default.PARAMS.TYPE_OF_MSG]) {
                case worker_page_message_1.default.TYPES_OF_MSG.PUSH_MSG_RECEIVED:
                case worker_page_message_1.default.TYPES_OF_MSG.NOTIFICATION_CLICKED:
                    var pushMessage = workerPageMessage[worker_page_message_1.default.PARAMS.DATA];
                    if (_this.messageObserver_) {
                        _this.messageObserver_.next(pushMessage);
                    }
                    break;
                default:
                    // Noop.
                    break;
            }
        }, false);
    };
    /**
     * Checks to see if the required API's are valid or not.
     * @private
     * @return {boolean} Returns true if the desired APIs are available.
     */
    WindowController.prototype.isSupported_ = function () {
        return ('serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window &&
            'fetch' in window &&
            ServiceWorkerRegistration.prototype.hasOwnProperty('showNotification') &&
            PushSubscription.prototype.hasOwnProperty('getKey'));
    };
    return WindowController;
}(controller_interface_1.default));
exports.default = WindowController;

//# sourceMappingURL=window-controller.js.map