// A simply and straight forward data infrastructure.
// Relying on MongoDB's API, and simply wrapping it
// with a more convenient syntax.

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
import isNumber from 'lodash/isNumber';

let connection = null;

async function getConnection() {
    try {
        if (!connection) {
            // If connection has not been initiated yet, connect
            // to Mongo and cache the connection for further usage.
            // MongoClient.connect returns a promise and this we
            // can declare the getConnection as async, and await
            // for the promise to resolve.
            connection = await MongoClient.connect('mongodb://localhost:27017/riddli');
        }
    }
    catch (e) {
        console.error(e);
    }

    return connection;
}

export async function findOneAndReplace(collection, id, data) {
    let db = await getConnection();
    let result = null;

    try {
        // Basic findOneAndReplace logic, wrapping ID with ObjectId
        // and setting flags in order to get the updated document.
        result = (await db.collection(collection).findOneAndReplace({ _id: ObjectId(id) },
            data, { returnOriginal: false, returnNewDocument: true })).value;
    }
    catch (e) {
        console.error(e, e.stack.split("\n"));
    }

    return result;
}

export async function findOneAndUpdate(collection, id, data) {
    let db = await getConnection();
    let result = null;

    try {
        // Basic findOneAndUpdate logic, wrapping ID with ObjectId
        // and setting flags in order to get the updated document.
        result = (await db.collection(collection).findOneAndUpdate({ _id: ObjectId(id) },
            data, { returnOriginal: false, returnNewDocument: true })).value;
    }
    catch (e) {
        console.error(e, e.stack.split("\n"));
    }

    return result;
}

export async function insert(collection, data) {
    let db = await getConnection();
    let result = null;

    try {
        if (Array.isArray(data)) {
            // If multiple records are supplied, using the insertMany function
            // and returning a collection of inserted documents
            result = (await db.collection(collection).insertMany(data)).ops;
        }
        else {
            // If a single one is provided, inserting it and
            // returning a single document.
            result = (await db.collection(collection).insert(data)).ops[0];
        }
    }
    catch (e) {
        console.error(e, e.stack.split("\n"));
    }

    return result;
}

export async function update(collection, query, data) {
    let db = await getConnection();
    let result = null;

    try {
        // Simple update. Using the multi flag (update more
        // than one records the match the criteria if found) by default.
        result = (await db.collection(collection).update(query, data, { multi: true }));
    }
    catch (e) {
        console.error(e, e.stack.split("\n"));
    }

    return result;
}

export async function find(collection, params = {}) {
    let db = await getConnection();
    let result = null;
    let fields = params.fields || {};

    try {
        if (params.excludeId) {
            // Skip the ID field when not necessary. Each
            // developer which calls this method may decide
            // whether ID is wanted or not.
            fields._id = 0;
        }

        let action = db.collection(collection).find(params.query, fields);

        if (isNumber(params.limit)) {
            action = action.limit(params.limit)
        }

        if (!params.cursor) {
            // By default, MongoDB returns a cursor that
            // can be iterated over. Usually it's nicer to
            // use a good old array instead. Still nice to
            // have this feature available under a flag.
            action = action.toArray()
        }

        // DB query is well defined in this point,
        // Waiting for it to complete.
        result = await action;

        if (!params.list && result.length === 1) {
            // If a single document is found, return it
            // directly instead of having a one-item-collection
            result = result[0];
        }
        else if (!params.list && result.length === 0) {
            // If no document was found, return null. It's easier
            // to handle exceptions this way, instead of having
            // and empty collection.
            result = null;
        }
    }
    catch (e) {
        console.error(e, e.stack.split("\n"));
    }

    return result;
}

export async function findById(collection, id) {
    return await find(collection, { query: { _id : ObjectId(id) } });
}

export async function drop(collection) {
    let db = await getConnection();
    let result = null;

    try {
        result = await db.collection(collection).drop();
    }
    catch (e) {
        console.error(e, e.stack.split("\n"));
    }

    return result;
}

export function objectId(string) {
    return new ObjectId(string);
}