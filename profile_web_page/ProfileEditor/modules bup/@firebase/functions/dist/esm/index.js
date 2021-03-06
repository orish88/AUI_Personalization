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
import firebase from '@firebase/app';
import { Service } from './src/api/service';
/**
 * Type constant for Firebase Functions.
 */
var FUNCTIONS_TYPE = 'functions';
function factory(app, unused, region) {
    return new Service(app, region);
}
export function registerFunctions(instance) {
    var namespaceExports = {
        // no-inline
        Functions: Service
    };
    instance.INTERNAL.registerService(FUNCTIONS_TYPE, factory, namespaceExports, 
    // We don't need to wait on any AppHooks.
    undefined, 
    // Allow multiple functions instances per app.
    true);
}
registerFunctions(firebase);

//# sourceMappingURL=index.js.map
