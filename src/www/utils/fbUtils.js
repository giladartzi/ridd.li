import config from '../../../config';

function init(promiseHandlers) {
    FB.init({
        appId      : config.appId,
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use graph api version 2.5
    });

    FB.getLoginStatus(function(response) {
        promiseHandlers.resolve(response);
    });
}

export function checkFacebookLogInStatus() {
    let promiseHandlers = {};
    let result = new Promise((resolve, reject) => {
        promiseHandlers.resolve = resolve;
        promiseHandlers.reject = reject;
    });
    
    // Only loading the FB script on demand, there
    // is no use to include it by default.
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    if (typeof FB !== 'undefined') {
        init(promiseHandlers);
    }
    else {
        window.fbAsyncInit = init.bind(null, promiseHandlers);
    }

    // Returning a promise wrapped function + callback
    return result;
}

export function logInToFacebook() {
    let promiseHandlers = {};
    let result = new Promise((resolve, reject) => {
        promiseHandlers.resolve = resolve;
        promiseHandlers.reject = reject;
    });
    
    FB.login(function(response) {
        promiseHandlers.resolve(response);
    }, { scope: 'public_profile,email' });
    
    return result;
}