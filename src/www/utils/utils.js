import { get, post } from '../../common/rest';
import { EXPECTED_AN_ARRAY_OF_THREE_STRING_TYPES } from '../../common/errors';
import { UNAUTHORIZED } from '../../common/consts';
import { push } from 'react-router-redux';

function dispatchSuccess(successType, res, onSuccess, dispatch, getState) {
    // Generic dispatch function. Takes the success action type and
    // response from the server. An addition optional argument is
    // an onSuccess function, which runs after a successful dispatch.
    
    if (res.json.error) {
        throw new Error(res.json.error);
    }

    dispatch({ type: successType, payload: res.json });

    if (typeof onSuccess === 'function') {
        onSuccess(res, dispatch, getState);
    }
}

function dispatchFailure(failureType, error, dispatch) {
    // Generic failure dispatch function.
    dispatch({ type: failureType, error });

    if (error === UNAUTHORIZED) {
        localStorage.clear();
        window.location.href = '/';
    }
}

// Inspired by http://redux.js.org/docs/recipes/ReducingBoilerplate.html
// A react middleware to handle a certain type of actions, which represent
// a generic REST API call. It takes three type consts, usually X_REQUEST,
// X_SUCCESS and X_FAILURE and a refrence to a fetch function which is a
// GET or POST requests, implemented generically at common/rest.js. 99%
// (if not a hundred percent) of the API calls use this middleware, making
// the action creator very very lean, as it basically only holds the consts
// and an a fetch call.
export function restApiMiddleware({ dispatch, getState }) {
    return next => async action => {
        const { types, fetch, onSuccess } = action;

        if (!types) {
            // Normal action: pass it on
            return next(action);
        }

        if (!Array.isArray(types) || types.length !== 3 || !types.every(type => typeof type === 'string')) {
            throw new Error(EXPECTED_AN_ARRAY_OF_THREE_STRING_TYPES)
        }

        const [ requestType, successType, failureType ] = types;

        dispatch({ type: requestType });

        try {
            let res = await fetch(dispatch, getState);
            dispatchSuccess(successType, res, onSuccess, dispatch, getState);
        }
        catch (e) {
            dispatchFailure(failureType, e.message, dispatch);
        }
    }
}

export function createReducer(initialState, handlers) {
    // Create a generic reducer. Gets a map of action-type consts
    // and handlers, and creating a reducer dynamically. There is
    // absolutely no logic here. The sole purpose is to reduce boilerplate
    
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action)
        } else {
            return state
        }
    }
}

// Simple action creators that match the structure of restApiMiddleware
export function createApiActionPost(types, path, payload, appendix) {
    return Object.assign({}, { types, fetch: () => post(path, payload) }, appendix);
}

export function createApiActionGet(types, path, appendix) {
    return Object.assign({}, { types, fetch: () => get(path) }, appendix);
}

export function createApiAction(types, path, payload, appendix) {
    return createApiActionPost(types, path, payload, appendix);
}

export function createApiReducer(types, initialState = {}, payloadPath) {
    // Create generic reducers for REST API calls. Every REST API call
    // has action-types consts for request, success and failure. Request
    // action does not have any payload, except for a pending flag, in
    // order to update to UI accordingly (sometimes used to disabling and such).
    // Success action is expected to have a payload, which will be merged
    // into the state using Object.assign. Failure action is expected to have
    // and error string, which will be displayed to the user or used to handle
    // unexpected behaviors.
    
    const [ requestType, successType, failureType ] = types;
    const defaultInitialState = {
        error: null,
        pending: false
    };

    return createReducer(Object.assign({}, initialState, defaultInitialState), {
        [requestType](state, action) {
            return Object.assign({}, state, { pending: true });
        },
        [successType](state, action) {
            let payload = action.payload[payloadPath] || action.payload;
            return Object.assign({}, state, { pending: false, error: null }, payload);
        },
        [failureType](state, action) {
            return Object.assign({}, state, { pending: false, error: action.error });
        }
    });
}

export function composeReducers(...reducers) {
    // A generic function that composes reducers one
    // after the other to handle a single action. This
    // is usually very useful when having multiple actions
    // that affect a single field in the store. 
    return function (state, action) {
        let result = state;
        reducers.forEach(reducer => {
            result = reducer(result, action);
        });
        return result;
    }
}

export function logInAppendix(path) {
    return {
        onSuccess: (res, dispatch) => {
            let payload = res.json[path] || res.json;
            localStorage.token = payload.token;
            localStorage.userId = payload.id;
            localStorage.displayName = payload.displayName;
            localStorage.email = payload.email;
            localStorage.picture = payload.picture;
            dispatch(push('/lounge'));
        }
    };
}