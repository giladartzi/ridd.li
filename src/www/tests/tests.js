var windows;

module.exports = {
    tags: ['123'],
    'Register without username and password': function (client) {
        client
            .url('http://localhost:3000/register')
            .waitForElementVisible('body', 1000)
            .assert.visible('input[name=username]')
            .assert.visible('input[name=password]')
            .click('button[type=submit]')
            .pause(500)
            .assert.containsText('form.register .error', 'Please provide both Username and Password')
    },
    'Register': function (client) {
        client
            .setValue('input[name=username]', 'newUser1')
            .setValue('input[name=password]', 'newUser1Pass')
            .waitForElementVisible('button[type=submit]', 1000)
            .click('button[type=submit]')
            .pause(1000)
    },
    'Verify username': function (client) {
        client.waitForElementVisible('#welcome #username', 1000)
            .assert.containsText('#welcome #username', 'newUser1')
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
            .url('http://127.0.0.1:3000/register')
            .setValue('input[name=username]', 'newUser2')
            .setValue('input[name=password]', 'newUser2Pass')
            .waitForElementVisible('button[type=submit]', 1000)
            .click('button[type=submit]')
            .pause(1000)
    },
    'Verify username - second user': function (client) {
        client.waitForElementVisible('#welcome #username', 1000)
            .assert.containsText('#welcome #username', 'newUser2')
    },
    'Lounge - second user': function (client) {
        client
            .assert.visible('#lounge .user')
            .assert.containsText('#lounge .user', 'newUser1')
    },
    'First user - refresh': function (client) {
        client.switchWindow(windows[0])
            .execute(function () { window.location.href = '/lounge'; })
            .pause(1000);
    },
    'Lounge - first user': function (client) {
        client
            .assert.visible('#lounge .user')
            .assert.containsText('#lounge .user', 'newUser2')
            .click('#lounge .user')
            .pause(500)
            .assert.containsText('#outgoingInvitation', 'Outgoing invitation to newUser2')
    },
    'Second user - refresh': function (client) {
        client.switchWindow(windows[1])
            .execute(function () { window.location.href = '/lounge'; })
            .pause(1000)
            .assert.containsText('#incomingInvitation', 'Incoming invitation from newUser1')
            .click('#incomingInvitation')
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
            .execute(function () { window.location.href = '/lounge'; })
            .pause(1000)
            .assert.containsText('#gameLink', 'Game')
            .click('#gameLink')
            .pause(500)
            .assert.containsText('#gameHeader', 'Game');
    },
    'User #1 - Answer question 1': function (client) {
        client.switchWindow(windows[0])
            .click('#answer1')
            .pause(500);
    },
    'User #2 - Answer question 1': function (client) {
        client.switchWindow(windows[1])
            .execute(function () { window.location.href = '/game'; })
            .pause(1000)
            .click('#answer1')
            .pause(500);
    },
    'User #2 - Answer question 2': function (client) {
        client
            .click('#answer1')
            .pause(500);
    },
    'User #1 - Answer question 2': function (client) {
        client.switchWindow(windows[0])
            .execute(function () { window.location.href = '/game'; })
            .pause(1000)
            .click('#answer1')
            .pause(500);
    },
    'User #1 - Answer question 3': function (client) {
        client
            .click('#answer1')
            .pause(500);
    },
    'User #2 - Answer question 3': function (client) {
        client.switchWindow(windows[1])
            .execute(function () { window.location.href = '/game'; })
            .pause(1000)
            .click('#answer1')
            .pause(500);
    },
    after: function(client) {
        client.pause(50000).end();
    }
};