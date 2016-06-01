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

    // If password is not supplied, but a Facebook userId is,
    // creating a random password for the user. This user is
    // a regular user just like native ones, simply its data
    // is supplied by FB and not the sign up form.
    if (!password && fbUserId) {
        password = guid();
    }

    if (!firstName || !lastName || !email || !password) {
        throw new Error(errors.PLEASE_FILL_ALL_REQUESTED_FIELDS);
    }

    if (!isValidEmail(email)) {
        throw new Error(errors.INVALID_EMAIL_ADDRESS);
    }

    // Encode password for security reasons
    let salt = await genSalt();
    let hashed = await hash(password, salt);

    // Save new user to DB
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
    
    // When a user signs up, we'd like for him to jump straight
    // to the application. Immediately initiating login process.
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
        // Throwing the same error for non existing user
        // and for wrong password. Believed to be a better
        // practice for obfuscation reasons.
        throw new Error(errors.INVALID_CREDENTIALS);
    }

    // User has successfully authenticated. Creating a JWT token.
    let token = await sign(userSignJson(user));

    // When the user has successfully logged in, we'd like him to
    // be completely synchronized about his data from previous sessions
    // (active invitations, games, etc) hence overloading the login
    // response with the sync call.
    return await sync(user._id.toString(), user.displayName, email, user.picture, token);
}

export async function fbLogin(fbUserId, fbAccessToken) {
    // With the Facebook authentication progress, signing up
    // and logging in, at least from the user's perspective is the
    // same thing. User is simply required to click a button.
    // Hence, only login call is available. If user does not exist,
    // creating it.
    
    // Verifying user token with FB's API.
    let fields = 'id,first_name,last_name,email,name,picture';
    let url = `https://graph.facebook.com/${fbUserId}?fields=${fields}&access_token=${fbAccessToken}`;
    let fbUserDetails = await fetch(url).then(res => res.json());

    // FB's response holds the user ID. If not such ID is
    // available, it means that the request has failed. In
    // that case, throwing an exception.
    if (!fbUserDetails.id) {
        throw new Error(errors.FACEBOOK_LOGIN_FAILURE);
    }

    // On the other hand, if the ID is available, we must
    // make sure it is equal to the ID supplied by the user
    // who asks to authenticate, in order to make sure the
    // user is actually who he says he is.
    if (fbUserDetails.id !== fbUserId) {
        throw new Error(errors.FB_BAD_USER_ID);
    }

    // Search for the user in DB
    let user = await dataLayer.find('users', { query: { fbUserId } });

    if (!user) {
        // If the user does not exist, create it with the data
        // fetched from Facebook's API. A user which authenticates via
        // FB, is a regular user, the only difference is its data is
        // retrieved from the API instead of the sign up form. This way
        // we are not dependent on FB's OAuth sessions, and can simply
        // use JWT generically like every other part of the system.
        await signUp(fbUserDetails.first_name, fbUserDetails.last_name, fbUserDetails.email,
            fbUserDetails.id, null, fbUserDetails.picture.data.url);
        user = await dataLayer.find('users', { query: { fbUserId } });
    }

    // Creating a JWT token for the user
    let token = await sign(userSignJson(user));
    
    // Overloading response with important data, see comment in
    // the same part of the login method in this module.
    return await sync(user._id.toString(), user.displayName, user.email, user.picture, token);
}