var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var utils = require('./utils');
import isNumber from 'lodash/isNumber';

let connection = null;

async function getConnection() {
    try {
        if (!connection) {
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
        result = (await db.collection(collection).findOneAndReplace({ _id: ObjectId(id) },
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
            result = (await db.collection(collection).insertMany(data)).ops;
        }
        else {
            result = (await db.collection(collection).insert(data)).ops[0];
        }
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
            fields._id = 0;
        }

        let action = db.collection(collection).find(params.query, fields);

        if (isNumber(params.limit)) {
            action = action.limit(params.limit)
        }

        if (!params.cursor) {
            action = action.toArray()
        }

        result = await action;

        if (result.length === 1) {
            result = result[0];
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