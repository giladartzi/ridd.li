import * as dataLayer from '../dataLayer';
import { hash, genSalt, sign, isValidEmail } from '../utils/userUtils';
import * as errors from '../../common/errors';

export function userJson(id, username, token) {
    return { id, username, token };
}

export async function signUp(email, username, password) {
    // check that username is available
    let exists = !!(await dataLayer.find('users', {
        query: { $or: [{ username }, { email }] }
    }));
    
    if (exists) {
        throw new Error(errors.USERNAME_IS_TAKEN_OR_EMAIL_ADDRESS_IN_USE);
    }

    if (!username || !password || !email) {
        throw new Error(errors.PLEASE_FILL_ALL_REQUESTED_FIELDS);
    }

    if (!isValidEmail(email)) {
        throw new Error(errors.INVALID_EMAIL_ADDRESS);
    }

    // encode password
    let salt = await genSalt();
    let hashed = await hash(password, salt);

    // save to db
    let user = await dataLayer.insert('users', {
        username,
        email,
        salt,
        hashed
    });
    
    // login
    let loggedIn = await login(username, password);

    return userJson(user._id, user.username, loggedIn.token);
}

export async function login(username, password) {
    if (!username) {
        throw new Error(errors.PLEASE_ENTER_YOUR_USERNAME);
    }

    if (!password) {
        throw new Error(errors.PLEASE_ENTER_YOUR_PASSWORD);
    }

    let user = await dataLayer.find('users', { query: { username } });
    let hashed = await hash(password, user && user.salt);

    if (!user || user.hashed !== hashed) {
        throw new Error(errors.INVALID_CREDENTIALS);
    }

    let token = await sign({ id: user._id, username: username });

    return userJson(user._id, user.username, token);
}