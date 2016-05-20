import * as dataLayer from '../dataLayer';
import { hash, genSalt, sign, isValidEmail } from '../utils/userUtils';

function userJson(id, username, token) {
    return { id, username, token };
}

export async function register(email, username, password) {
    // check that username is available
    let exists = !!(await dataLayer.find('users', {
        query: { $or: [{ username }, { email }] }
    }));
    
    if (exists) {
        throw new Error('Username is taken or email address in use');
    }

    if (!username || !password || !email) {
        throw new Error('Please fill all requested fields');
    }

    if (!isValidEmail(email)) {
        throw new Error('Invalid email address');
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
    
    // authenticate
    let authenticated = await authenticate(username, password);

    return userJson(user._id, user.username, authenticated.token);
}

export async function authenticate(username, password) {
    if (!username) {
        throw new Error('Please enter your username');
    }

    if (!password) {
        throw new Error('Please enter your password');
    }

    let user = await dataLayer.find('users', { query: { username } });
    let hashed = await hash(password, user && user.salt);

    if (!user || user.hashed !== hashed) {
        throw new Error('Invalid credentials');
    }

    let token = await sign({ id: user._id, username: username });

    return userJson(user._id, user.username, token);
}