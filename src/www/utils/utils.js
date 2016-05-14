import { get, post } from '../../common/rest';

// Inspired by http://redux.js.org/docs/recipes/ReducingBoilerplate.html
export function restApiMiddleware({ dispatch, getState }) {
    return next => async action => {
        const { types, fetch } = action;

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
            dispatch({ type: successType, payload: res.json });
        }
        catch (e) {
            dispatch({ type: failureType, error: e.message });
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
    })
}

export function createApiActionPost(types, path, payload) {
    return {
        types,
        fetch: () => post(path, payload)
    };
}

export function createApiActionGet(types, path, payload) {
    return {
        types,
        fetch: () => get(path, payload)
    };
}

export function createApiAction(types, path, payload) {
    return createApiActionPost(types, path, payload);
}