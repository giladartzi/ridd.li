export const toPromise = (func, context) => {
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