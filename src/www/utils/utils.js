import { get, post } from '../../common/rest';

function dispatchSuccess(successType, res, onSuccess, dispatch, getState) {
    if (res.json.error) {
        throw new Error(res.json.error);
    }

    dispatch({ type: successType, payload: res.json });

    if (typeof onSuccess === 'function') {
        onSuccess(res, dispatch, getState);
    }
}

function dispatchFailure(failureType, error, dispatch) {
    dispatch({ type: failureType, error });
}

// Inspired by http://redux.js.org/docs/recipes/ReducingBoilerplate.html
export function restApiMiddleware({ dispatch, getState }) {
    return next => async action => {
        const { types, fetch, onSuccess } = action;

        if (!types) {
            // Normal action: pass it on
            return next(action);
        }

        if (!Array.isArray(types) || types.length !== 3 || !types.every(type => typeof type === 'string')) {
            throw new Error('Expected an array of three string types.')
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
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action)
        } else {
            return state
        }
    }
}

export function createApiReducer(types, initialState = {}) {
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
            return Object.assign({}, state, { pending: false, error: null }, action.payload);
        },
        [failureType](state, action) {
            return Object.assign({}, state, { pending: false, error: action.error });
        }
    });
}

export function createApiActionPost(types, path, payload, appendix) {
    return Object.assign({}, {
        types,
        fetch: () => post(path, payload)
    }, appendix);
}

export function createApiActionGet(types, path, appendix) {
    return Object.assign({}, {
        types,
        fetch: () => get(path)
    }, appendix);
}

export function createApiAction(types, path, payload, appendix) {
    return createApiActionPost(types, path, payload, appendix);
}