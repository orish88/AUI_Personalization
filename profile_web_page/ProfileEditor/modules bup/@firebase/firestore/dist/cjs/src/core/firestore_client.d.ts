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
import { CredentialsProvider } from '../api/credentials';
import { ListenOptions, Observer, QueryListener } from './event_manager';
import { Mutation } from '../model/mutation';
import { Platform } from '../platform/platform';
import { AsyncQueue } from '../util/async_queue';
import { DatabaseId, DatabaseInfo } from './database_info';
import { Query } from './query';
import { Transaction } from './transaction';
import { ViewSnapshot } from './view_snapshot';
/**
 * FirestoreClient is a top-level class that constructs and owns all of the
 * pieces of the client SDK architecture. It is responsible for creating the
 * async queue that is shared by all of the other components in the system.
 */
export declare class FirestoreClient {
    private platform;
    private databaseInfo;
    private credentials;
    /**
     * Asynchronous queue responsible for all of our internal processing. When
     * we get incoming work from the user (via public API) or the network
     * (incoming GRPC messages), we should always schedule onto this queue.
     * This ensures all of our work is properly serialized (e.g. we don't
     * start processing a new operation while the previous one is waiting for
     * an async I/O to complete).
     */
    private asyncQueue;
    private eventMgr;
    private garbageCollector;
    private persistence;
    private localStore;
    private remoteStore;
    private syncEngine;
    constructor(platform: Platform, databaseInfo: DatabaseInfo, credentials: CredentialsProvider, 
        /**
         * Asynchronous queue responsible for all of our internal processing. When
         * we get incoming work from the user (via public API) or the network
         * (incoming GRPC messages), we should always schedule onto this queue.
         * This ensures all of our work is properly serialized (e.g. we don't
         * start processing a new operation while the previous one is waiting for
         * an async I/O to complete).
         */
        asyncQueue: AsyncQueue);
    /**
     * Starts up the FirestoreClient, returning only whether or not enabling
     * persistence succeeded.
     *
     * The intent here is to "do the right thing" as far as users are concerned.
     * Namely, in cases where offline persistence is requested and possible,
     * enable it, but otherwise fall back to persistence disabled. For the most
     * part we expect this to succeed one way or the other so we don't expect our
     * users to actually wait on the firestore.enablePersistence Promise since
     * they generally won't care.
     *
     * Of course some users actually do care about whether or not persistence
     * was successfully enabled, so the Promise returned from this method
     * indicates this outcome.
     *
     * This presents a problem though: even before enablePersistence resolves or
     * rejects, users may have made calls to e.g. firestore.collection() which
     * means that the FirestoreClient in there will be available and will be
     * enqueuing actions on the async queue.
     *
     * Meanwhile any failure of an operation on the async queue causes it to
     * panic and reject any further work, on the premise that unhandled errors
     * are fatal.
     *
     * Consequently the fallback is handled internally here in start, and if the
     * fallback succeeds we signal success to the async queue even though the
     * start() itself signals failure.
     *
     * @param usePersistence Whether or not to attempt to enable persistence.
     * @returns A deferred result indicating the user-visible result of enabling
     *     offline persistence. This method will reject this if IndexedDB fails to
     *     start for any reason. If usePersistence is false this is
     *     unconditionally resolved.
     */
    start(usePersistence: boolean): Promise<void>;
    /** Enables the network connection and requeues all pending operations. */
    enableNetwork(): Promise<void>;
    /**
     * Initializes persistent storage, attempting to use IndexedDB if
     * usePersistence is true or memory-only if false.
     *
     * If IndexedDB fails because it's already open in another tab or because the
     * platform can't possibly support our implementation then this method rejects
     * the persistenceResult and falls back on memory-only persistence.
     *
     * @param usePersistence indicates whether or not to use offline persistence
     * @param persistenceResult A deferred result indicating the user-visible
     *     result of enabling offline persistence. This method will reject this if
     *     IndexedDB fails to start for any reason. If usePersistence is false
     *     this is unconditionally resolved.
     * @returns a Promise indicating whether or not initialization should
     *     continue, i.e. that one of the persistence implementations actually
     *     succeeded.
     */
    private initializePersistence(usePersistence, persistenceResult);
    private canFallback(error);
    /**
     * Starts IndexedDB-based persistence.
     *
     * @returns A promise indicating success or failure.
     */
    private startIndexedDbPersistence();
    /**
     * Starts Memory-backed persistence. In practice this cannot fail.
     *
     * @returns A promise that will successfully resolve.
     */
    private startMemoryPersistence();
    /**
     * Initializes the rest of the FirestoreClient, assuming the initial user
     * has been obtained from the credential provider and some persistence
     * implementation is available in this.persistence.
     */
    private initializeRest(user);
    private handleUserChange(user);
    /** Disables the network connection. Pending operations will not complete. */
    disableNetwork(): Promise<void>;
    shutdown(): Promise<void>;
    listen(query: Query, observer: Observer<ViewSnapshot>, options: ListenOptions): QueryListener;
    unlisten(listener: QueryListener): void;
    write(mutations: Mutation[]): Promise<void>;
    databaseId(): DatabaseId;
    transaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
}
