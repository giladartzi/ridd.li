import { toPromise } from './utils';
import bcrypt from 'bcrypt-nodejs';
import jwt from 'jsonwebtoken';
import { findById } from '../dataLayer';
import { UNAUTHORIZED } from '../../common/consts';
import config from '../../../config';

export async function hash(password, salt) {
    let pHash = toPromise(bcrypt.hash);
    return await pHash(password, salt, null);
}

export async function genSalt() {
    return await toPromise(bcrypt.genSalt)(10);
}

export async function sign(obj) {
    let pSign = toPromise(jwt.sign);
    return await pSign(obj, config.secret, null);
}

export async function jwtVerify(token) {
    let pVerify = toPromise(jwt.verify);
    return await pVerify(token, config.secret, null);
}

export async function jwtMiddleware(req, res, next) {
    try {
        req.user = await jwtVerify(req.headers.token);
        next();
    }
    catch (e) {
        res.status(403).send({error: UNAUTHORIZED});
    }
}

export function isValidEmail(email) {
    // Credit: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

let displayNameCache = {};

export async function getDisplayNameByUserId(userId) {
    if (typeof displayNameCache[userId] !== 'undefined') {
        return displayNameCache[userId];
    }
    
    let user = await findById('users', userId);
    let result = null;

    if (user) {
        result = user.firstName + ' ' + user.lastName;
    }

    displayNameCache[userId] = result;
    return result;
}

export function guid() {
    // Credit: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}