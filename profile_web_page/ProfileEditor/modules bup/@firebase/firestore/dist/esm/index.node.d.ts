import './src/platform_node/node_init';
import * as types from '@firebase/firestore-types';
export declare function registerFirestore(instance: any): void;
declare module '@firebase/app-types' {
    interface FirebaseNamespace {
        firestore?: {
            (app?: FirebaseApp): types.FirebaseFirestore;
            Blob: typeof types.Blob;
            CollectionReference: typeof types.CollectionReference;
            DocumentReference: typeof types.DocumentReference;
            DocumentSnapshot: typeof types.DocumentSnapshot;
            FieldPath: typeof types.FieldPath;
            FieldValue: typeof types.FieldValue;
            Firestore: typeof types.FirebaseFirestore;
            GeoPoint: typeof types.GeoPoint;
            Query: typeof types.Query;
            QuerySnapshot: typeof types.QuerySnapshot;
            Transaction: typeof types.Transaction;
            WriteBatch: typeof types.WriteBatch;
            setLogLevel: typeof types.setLogLevel;
        };
    }
    interface FirebaseApp {
        firestore?(): types.FirebaseFirestore;
    }
}
