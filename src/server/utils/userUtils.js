import { toPromise } from './utils';
import bcrypt from 'bcrypt-nodejs';
import jwt from 'jsonwebtoken';

export async function hash(password, salt) {
    let pHash = toPromise(bcrypt.hash);
    return await pHash(password, salt, null);
}

export async function genSalt() {
    return await toPromise(bcrypt.genSalt)(10);
}

export async function sign(obj) {
    let pSign = toPromise(jwt.sign);
    return await pSign(obj, 'secret', null);
}

export async function jwtVerify(token) {
    let pVerify = toPromise(jwt.verify);
    return await pVerify(token, 'secret', null);
}

export async function jwtMiddleware(req, res, next) {
    try {
        req.user = await jwtVerify(req.headers.token);
        next();
    }
    catch (e) {
        res.status(403).send({error: 'Unauthorized'});
    }
}

export function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}