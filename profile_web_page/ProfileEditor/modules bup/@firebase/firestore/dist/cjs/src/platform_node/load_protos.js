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
var grpc = require("grpc");
/**
 * Loads the protocol buffer definitions for Firestore.
 *
 * @returns The GrpcObject representing our protos.
 */
function loadProtos() {
    var options = {
        // Beware that converting fields to camel case does not convert the tag
        // fields in oneof groups (!!!). This will likely be fixed when we upgrade
        // to protobufjs 6.x
        convertFieldsToCamelCase: true
    };
    var root = __dirname + '/../protos';
    var firestoreProtoFile = {
        root: root,
        file: 'google/firestore/v1beta1/firestore.proto'
    };
    return grpc.load(firestoreProtoFile, /*format=*/ 'proto', options);
}
exports.loadProtos = loadProtos;

//# sourceMappingURL=load_protos.js.map
