export const toPromise = (func, context) => {
    // Taking a function the takes a callback, and
    // wrapping it with a promise.
    return function () {
        var args = arguments;

        return new Promise(function (resolve, reject) {
            var callback = function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            };

            func.apply(context || null, [...args, callback]);
        });
    }
};

export const asyncToPromise = (func) => {
    // Taking an async function and wrapping it with a promise
    return new Promise(async function (resolve, reject) {
        resolve(await func);
    });
};

export async function safeAwait(promise) {
    let result;

    try {
        result = await promise;
    }
    catch (e) {
        result = null;
    }

    return result;
}

export function requestHandlerWrapper(handler) {
    return async (req, res) => {
        let argArr = [req.body];
        
        if (req.user) {
            argArr = [req.user.id, req.body, req.user, req.headers.token];
        }
        
        try {
            res.json(await handler.apply(null, argArr));
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
}