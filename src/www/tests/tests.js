var windows;

function answer(userIndex, isCorrect) {
    return function (client) {
        client.switchWindow(windows[userIndex])
            .click('#answer1')
            .pause(500);
    }
}

module.exports = {
    tags: ['123'],
    'Register without username and password': function (client) {
        client
            .url('http://localhost:3000/')
            .execute(function () { localStorage.clear() })
            .url('http://localhost:3000/')
            .waitForElementVisible('body', 1000)
            .assert.visible('.genericForm.register .username input')
            .assert.visible('.genericForm.register .password input')
            .click('.genericForm.register button[type=submit]')
            .pause(500)
            .assert.containsText('.genericForm.register .error', 'Please provide both Username and Password')
    },
    'Register': function (client) {
        client
            .setValue('.genericForm.register .username input', 'newUser1')
            .setValue('.genericForm.register .password input', 'newUser1Pass')
            .waitForElementVisible('.genericForm.register button[type=submit]', 1000)
            .click('.genericForm.register button[type=submit]')
            .pause(1000)
    },
    'Verify username': function (client) {
        client.waitForElementVisible('.barMenu', 1000)
            .click('.barMenu')
            .waitForElementVisible('#barMenuUsername', 500)
            .assert.containsText('#barMenuUsername', 'newUser1')
            .click('#barMenuUsername');
    },
    'Empty lounge': function (client) {
        client
            .assert.visible('#emptyLoungeUserList')
            .assert.containsText('#emptyLoungeUserList', 'Waiting for opponents to log in...');
    },
    'Open new window': function (client) {
        client
            .execute(function (url, name) {
                window.open(url, name, "");
            }, ['', 'window2']);
    },
    'Switch window': function (client) {
        client.window_handles(function(result) {
            windows = result.value;
            var handle = result.value[1];
            client.switchWindow(handle);
        });
    },
    'Register - second user': function (client) {
        client
            .url('http://127.0.0.1:3000/')
            .execute(function () { localStorage.clear() })
            .url('http://127.0.0.1:3000/')
            .setValue('.genericForm.register .username input', 'newUser2')
            .setValue('.genericForm.register .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.register button[type=submit]', 1000)
            .click('.genericForm.register button[type=submit]')
            .pause(1000)
    },
    'Second user - Close browser': function (client) {
        client
            .execute(function () { localStorage.clear() })
            .closeWindow();

    },
    'Reopen window': function (client) {
        client
            .switchWindow(windows[0])
            .assert.visible('#emptyLoungeUserList')
            .assert.containsText('#emptyLoungeUserList', 'Waiting for opponents to log in...')
            .execute(function (url, name) {
                window.open(url, name, "");
            }, ['', 'window3']);
    },
    'Register windows and switch': function (client) {
        client.window_handles(function(result) {
            windows = result.value;
            var handle = result.value[1];
            client.switchWindow(handle);
        });
    },
    'Login - second user': function (client) {
        client
            .url('http://127.0.0.1:3000/')
            .execute(function () { localStorage.clear() })
            .url('http://127.0.0.1:3000/login')
            .setValue('.genericForm.login .username input', 'newUser2')
            .setValue('.genericForm.login .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.login button[type=submit]', 1000)
            .click('.genericForm.login button[type=submit]')
            .pause(1000)
    },
    'Logout - second user + verify username': function (client) {
        client.waitForElementVisible('.barMenu', 1000)
            .click('.barMenu')
            .waitForElementVisible('#barMenuUsername', 500)
            .waitForElementVisible('#barMenuLogout', 500)
            .assert.containsText('#barMenuUsername', 'newUser2')
            .click('#barMenuLogout');
    },
    'Login - second user - once again': function (client) {
        client
            .waitForElementVisible('#signInButton', 1000)
            .click('#signInButton')
            .setValue('.genericForm.login .username input', 'newUser2')
            .setValue('.genericForm.login .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.login button[type=submit]', 1000)
            .click('.genericForm.login button[type=submit]')
            .pause(1000)
    },
    'Lounge - second user': function (client) {
        client
            .assert.visible('.user div div div')
            .assert.containsText('.user div div div', 'newUser1')
    },
    'Lounge - first user': function (client) {
        client
            .switchWindow(windows[0])
            .assert.visible('.user div div div')
            .assert.containsText('.user div div div', 'newUser2')
            .click('.user div div div')
            .pause(500)
            .assert.containsText('#outgoingInvitation', 'Invitation sent to newUser2, waiting for reply.')
    },
    'Second user - refresh': function (client) {
        client.switchWindow(windows[1])
            .pause(1000)
            .assert.containsText('#incomingInvitation', 'Incoming invitation received from newUser1.')
            .click('#incomingInvitationAccept')
            .pause(1000);
    },
    'User #2 - Game link': function (client) {
        client.assert.containsText('#gameLink', 'Game')
            .click('#gameLink')
            .pause(500)
            .assert.containsText('#gameHeader', 'Game');
    },
    'User #1 - Game link': function (client) {
        client.switchWindow(windows[0])
            .assert.containsText('#gameLink', 'Game')
            .click('#gameLink')
            .pause(500)
            .assert.containsText('#gameHeader', 'Game');
    },
    'User #1 - Answer question 1': answer(0, false),
    'User #2 - Answer question 1': answer(1, true),
    'User #1 - Answer question 2': answer(0, false),
    'User #2 - Answer question 2': answer(1, true),
    'User #1 - Answer question 3': answer(0, false),
    'User #2 - Answer question 3': answer(1, true),
    'User #1 - Answer question 4': answer(0, false),
    'User #2 - Answer question 4': answer(1, true),
    'User #1 - Answer question 5': answer(0, false),
    'User #2 - Answer question 5': answer(1, true),
    'User #1 - Answer question 6': answer(0, false),
    'User #2 - Answer question 6': answer(1, true),
    'User #1 - Answer question 7': answer(0, false),
    'User #2 - Answer question 7': answer(1, true),
    'User #1 - Answer question 8': answer(0, false),
    'User #2 - Answer question 8': answer(1, true),
    'User #1 - Answer question 9': answer(0, false),
    'User #2 - Answer question 9': answer(1, true),
    'User #1 - Answer question 10': answer(0, false),
    'User #2 - Answer question 10': answer(1, true),
    after: function(client) {
        client.pause(1000).end();
    }
};