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

export async function jwtMiddleware(req, res, next) {
    let pVerify = toPromise(jwt.verify);

    try {
        req.user = await pVerify(req.headers.token, 'secret', null);
    }
    catch (e) {
        console.error(e);
    }
    
    if (req.user) {
        next();
    }
}