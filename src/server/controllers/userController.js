import * as dataLayer from '../dataLayer';
import { hash, genSalt, sign, isValidEmail, guid } from '../utils/userUtils';
import * as errors from '../../common/errors';
import { sync } from './syncController';

export function userJson(id, displayName, email, picture, token) {
    return { id, displayName, email, picture, token };
}

function userSignJson(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        picture: user.picture
    };
}

export async function signUp(firstName, lastName, email, fbUserId, password, picture) {
    // check that email is available
    let exists = !!(await dataLayer.find('users', { query: { email } }));
    
    if (exists) {
        throw new Error(errors.EMAIL_ADDRESS_IN_USE);
    }

    if (!password && fbUserId) {
        password = guid();
    }

    if (!firstName || !lastName || !email || !password) {
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
        firstName,
        lastName,
        email,
        fbUserId,
        picture,
        salt,
        hashed,
        displayName: (firstName + ' ' + lastName).trim()
    });
    
    // login
    let loggedIn = await login(email, password);

    return userJson(user._id, user.displayName, email, user.picture, loggedIn.user.token);
}

export async function login(email, password) {
    if (!email) {
        throw new Error(errors.PLEASE_ENTER_YOUR_EMAIL);
    }

    if (!password) {
        throw new Error(errors.PLEASE_ENTER_YOUR_PASSWORD);
    }

    let user = await dataLayer.find('users', { query: { email } });
    let hashed = await hash(password, user && user.salt);

    if (!user || user.hashed !== hashed) {
        throw new Error(errors.INVALID_CREDENTIALS);
    }

    let token = await sign(userSignJson(user));

    return await sync(user._id.toString(), user.displayName, email, user.picture, token);
}

export async function fbLogin(fbUserId, fbAccessToken) {
    let fields = 'id,first_name,last_name,email,name,picture';
    let url = `https://graph.facebook.com/${fbUserId}?fields=${fields}&access_token=${fbAccessToken}`;
    let fbUserDetails = await fetch(url).then(res => res.json());

    if (!fbUserDetails.id) {
        throw new Error(errors.FACEBOOK_LOGIN_FAILURE);
    }

    if (fbUserDetails.id !== fbUserId) {
        throw new Error(errors.FB_BAD_USER_ID);
    }

    let user = await dataLayer.find('users', { query: { fbUserId } });

    if (!user) {
        await signUp(fbUserDetails.first_name, fbUserDetails.last_name, fbUserDetails.email,
            fbUserDetails.id, null, fbUserDetails.picture.data.url);
        user = await dataLayer.find('users', { query: { fbUserId } });
    }

    let token = await sign(userSignJson(user));
    return await sync(user._id.toString(), user.displayName, user.email, user.picture, token);
}