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
/**
 * Describes the online state of the Firestore client. Note that this does not
 * indicate whether or not the remote store is trying to connect or not. This is
 * primarily used by the View / EventManager code to change their behavior while
 * offline (e.g. get() calls shouldn't wait for data from the server and
 * snapshot events should set metadata.isFromCache=true).
 */
var OnlineState;
(function (OnlineState) {
    /**
     * The Firestore client is in an unknown online state. This means the client
     * is either not actively trying to establish a connection or it is currently
     * trying to establish a connection, but it has not succeeded or failed yet.
     * Higher-level components should not operate in offline mode.
     */
    OnlineState[OnlineState["Unknown"] = 0] = "Unknown";
    /**
     * The client is connected and the connections are healthy. This state is
     * reached after a successful connection and there has been at least one
     * successful message received from the backends.
     */
    OnlineState[OnlineState["Online"] = 1] = "Online";
    /**
     * The client is either trying to establish a connection but failing, or it
     * has been explicitly marked offline via a call to disableNetwork().
     * Higher-level components should operate in offline mode.
     */
    OnlineState[OnlineState["Offline"] = 2] = "Offline";
})(OnlineState = exports.OnlineState || (exports.OnlineState = {}));

//# sourceMappingURL=types.js.map
