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
import { SortedMap } from '../util/sorted_map';
import { documentMap } from './collections';
import { DocumentKey } from './document_key';
/**
 * DocumentSet is an immutable (copy-on-write) collection that holds documents
 * in order specified by the provided comparator. We always add a document key
 * comparator on top of what is provided to guarantee document equality based on
 * the key.
 */
var DocumentSet = /** @class */ (function () {
    /** The default ordering is by key if the comparator is omitted */
    function DocumentSet(comp) {
        // We are adding document key comparator to the end as it's the only
        // guaranteed unique property of a document.
        if (comp) {
            this.comparator = function (d1, d2) {
                return comp(d1, d2) || DocumentKey.comparator(d1.key, d2.key);
            };
        }
        else {
            this.comparator = function (d1, d2) {
                return DocumentKey.comparator(d1.key, d2.key);
            };
        }
        this.keyedMap = documentMap();
        this.sortedSet = new SortedMap(this.comparator);
    }
    /**
     * Returns an empty copy of the existing DocumentSet, using the same
     * comparator.
     */
    DocumentSet.emptySet = function (oldSet) {
        return new DocumentSet(oldSet.comparator);
    };
    DocumentSet.prototype.has = function (key) {
        return this.keyedMap.get(key) != null;
    };
    DocumentSet.prototype.get = function (key) {
        return this.keyedMap.get(key);
    };
    DocumentSet.prototype.first = function () {
        return this.sortedSet.minKey();
    };
    DocumentSet.prototype.last = function () {
        return this.sortedSet.maxKey();
    };
    DocumentSet.prototype.isEmpty = function () {
        return this.sortedSet.isEmpty();
    };
    /**
     * Returns the index of the provided key in the document set, or -1 if the
     * document key is not present in the set;
     */
    DocumentSet.prototype.indexOf = function (key) {
        var doc = this.keyedMap.get(key);
        return doc ? this.sortedSet.indexOf(doc) : -1;
    };
    Object.defineProperty(DocumentSet.prototype, "size", {
        get: function () {
            return this.sortedSet.size;
        },
        enumerable: true,
        configurable: true
    });
    /** Iterates documents in order defined by "comparator" */
    DocumentSet.prototype.forEach = function (cb) {
        this.sortedSet.inorderTraversal(function (k, v) {
            cb(k);
            return false;
        });
    };
    /** Inserts or updates a document with the same key */
    DocumentSet.prototype.add = function (doc) {
        // First remove the element if we have it.
        var set = this.delete(doc.key);
        return set.copy(set.keyedMap.insert(doc.key, doc), set.sortedSet.insert(doc, null));
    };
    /** Deletes a document with a given key */
    DocumentSet.prototype.delete = function (key) {
        var doc = this.get(key);
        if (!doc) {
            return this;
        }
        return this.copy(this.keyedMap.remove(key), this.sortedSet.remove(doc));
    };
    DocumentSet.prototype.isEqual = function (other) {
        if (!(other instanceof DocumentSet))
            return false;
        if (this.size !== other.size)
            return false;
        var thisIt = this.sortedSet.getIterator();
        var otherIt = other.sortedSet.getIterator();
        while (thisIt.hasNext()) {
            var thisDoc = thisIt.getNext().key;
            var otherDoc = otherIt.getNext().key;
            if (!thisDoc.isEqual(otherDoc))
                return false;
        }
        return true;
    };
    DocumentSet.prototype.toString = function () {
        var docStrings = [];
        this.forEach(function (doc) {
            docStrings.push(doc.toString());
        });
        if (docStrings.length === 0) {
            return 'DocumentSet ()';
        }
        else {
            return 'DocumentSet (\n  ' + docStrings.join('  \n') + '\n)';
        }
    };
    DocumentSet.prototype.copy = function (keyedMap, sortedSet) {
        var newSet = new DocumentSet();
        newSet.comparator = this.comparator;
        newSet.keyedMap = keyedMap;
        newSet.sortedSet = sortedSet;
        return newSet;
    };
    return DocumentSet;
}());
export { DocumentSet };

//# sourceMappingURL=document_set.js.map
