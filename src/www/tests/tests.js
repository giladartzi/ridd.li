var errors = require('../../common/errors');

var windows;

function answer(userIndex, isCorrect, isFirst, pause) {
    return function (client) {
        client.switchWindow(windows[userIndex]);

        client.waitForElementVisible('#question', 1100);
        client.waitForElementVisible('#answers', 2000);


        client
            .pause(pause * 1000);
        
        client
            .click(isCorrect ? '.correctAnswer' : '.answer:first-of-type')
            .pause(500);

        if (isFirst) {
            client
                .assert.visible('#waitingForOpponent')
                .assert.containsText('#waitingForOpponent', 'Question answered, waiting for opponent')
        }
    }
}

module.exports = {
    tags: ['123'],
    'Sign Up without any details': function (client) {
        client
            .url('http://localhost2:3000/signup')
            .execute(function () { localStorage.clear() })
            .url('http://localhost2:3000/signup')
            .waitForElementVisible('body', 1000)
            .assert.visible('.genericForm.signUp .email input')
            .assert.visible('.genericForm.signUp .firstName input')
            .assert.visible('.genericForm.signUp .lastName input')
            .assert.visible('.genericForm.signUp .password input')
            .click('.genericForm.signUp button[type=submit]')
            .pause(500)
            .assert.containsText('.genericForm.signUp .error', errors.PLEASE_FILL_ALL_REQUESTED_FIELDS)
    },
    'Sign Up': function (client) {
        client
            .setValue('.genericForm.signUp .email input', 'newUser1@domain.com')
            .setValue('.genericForm.signUp .firstName input', 'New1')
            .setValue('.genericForm.signUp .lastName input', 'User1')
            .setValue('.genericForm.signUp .password input', 'newUser1Pass')
            .waitForElementVisible('.genericForm.signUp button[type=submit]', 1000)
            .click('.genericForm.signUp button[type=submit]')
            .pause(1000)
    },
    'Verify displayName': function (client) {
        client.waitForElementVisible('.barMenu', 1000)
            .click('.barMenu')
            .waitForElementVisible('#barMenuDisplayName', 500)
            .assert.containsText('#barMenuDisplayName', 'New1 User1')
            .click('#barMenuDisplayName');
    },
    'Verify leave game element to not exist': function (client) {
        client.click('.barMenu');
        client.pause(200);
        client.expect.element('#barMenuLeaveGame').to.not.be.present;
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
    'Open another window': function (client) {
        client
            .execute(function (url, name) {
                window.open(url, name, "");
            }, ['', 'window3']);
    },
    'Switch window': function (client) {
        client.window_handles(function(result) {
            windows = result.value;
            var handle = result.value[1];
            client.switchWindow(handle);
        });
    },
    'Set URL to third window': function (client) {
        client.url('http://localhost:3000/')
            .execute(function () { localStorage.clear() })
            .url('http://localhost:3000/');
    },
    'Sign Up - second user': function (client) {
        client
            .switchWindow(windows[2])
            .url('http://127.0.0.1:3000/signup')
            .execute(function () { localStorage.clear() })
            .url('http://127.0.0.1:3000/signup')
            .setValue('.genericForm.signUp .email input', 'newUser2@domain.com')
            .setValue('.genericForm.signUp .firstName input', 'New2')
            .setValue('.genericForm.signUp .lastName input', 'User2')
            .setValue('.genericForm.signUp .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.signUp button[type=submit]', 1000)
            .click('.genericForm.signUp button[type=submit]')
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
    'Sign Up windows and switch': function (client) {
        client.window_handles(function(result) {
            windows = result.value;
            var handle = result.value[2];
            client.switchWindow(handle);
        });
    },
    'Login - second user': function (client) {
        client
            .url('http://127.0.0.1:3000/')
            .execute(function () { localStorage.clear() })
            .url('http://127.0.0.1:3000/')
            .setValue('.genericForm.login .email input', 'newUser2@domain.com')
            .setValue('.genericForm.login .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.login button[type=submit]', 1000)
            .click('.genericForm.login button[type=submit]')
            .pause(1000)
    },
    'Logout - second user + verify displayName': function (client) {
        client.waitForElementVisible('.barMenu', 1000)
            .click('.barMenu')
            .waitForElementVisible('#barMenuDisplayName', 500)
            .waitForElementVisible('#barMenuLogout', 500)
            .assert.containsText('#barMenuDisplayName', 'New2 User2')
            .click('#barMenuLogout')
            .pause(1000);
    },
    'Login - second user - once again - missing email': function (client) {
        client
            .setValue('.genericForm.login .email input', '')
            .setValue('.genericForm.login .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.login button[type=submit]', 1000)
            .click('.genericForm.login button[type=submit]')
            .pause(1000)
            .waitForElementVisible('.genericForm.login .error', 1000)
            .assert.containsText('.genericForm.login .error', errors.PLEASE_ENTER_YOUR_EMAIL)
            .pause(1000)
    },
    'Login - second user - once again - missing password': function (client) {
        client
            .refresh()
            .pause(1000)
            .setValue('.genericForm.login .email input', 'newUser2@domain.com')
            .waitForElementVisible('.genericForm.login button[type=submit]', 1000)
            .click('.genericForm.login button[type=submit]')
            .pause(1000)
            .waitForElementVisible('.genericForm.login .error', 1000)
            .assert.containsText('.genericForm.login .error', errors.PLEASE_ENTER_YOUR_PASSWORD)
            .pause(1000)
            .refresh()
            .pause(1000)

    },
    'Login - second user - once again - correctly': function (client) {
        client
            .setValue('.genericForm.login .email input', 'newUser2@domain.com')
            .setValue('.genericForm.login .password input', 'newUser2Pass')
            .waitForElementVisible('.genericForm.login button[type=submit]', 1000)
            .click('.genericForm.login button[type=submit]')
            .pause(1000)
    },
    'Lounge - second user': function (client) {
        client
            .assert.visible('.user div div div')
            .assert.containsText('.user div div div', 'New1 User1')
    },
    'Third users logs in': function (client) {
        client.switchWindow(windows[1]);
        client.expect.element('#fbLogIn').to.be.present;
        client.click('#fbLogIn');
        client.pause(10000);
    },
    'Lounge - first user': function (client) {
        client
            .switchWindow(windows[0])
            .assert.visible('.user div div div')
            .assert.containsText('.user div div div', 'New2 User2')
            .click('.user div div div')
            .assert.containsText('#outgoingInvitation', 'Invitation sent to New2 User2, waiting for reply.')
            .pause(500)
    },
    'Second user - accept invitation': function (client) {
        client.switchWindow(windows[2])
            .pause(1000)
            .assert.containsText('#incomingInvitation', 'Incoming invitation received from New1 User1.')
            .click('#incomingInvitationAccept')
            .pause(1000);
    },
    'User #2 - Game': function (client) {
        client.pause(500);
    },
    'User #1 - Game': function (client) {
        client.switchWindow(windows[0])
            .pause(500);
    },
    'Verify leave game element': function (client) {
        client.click('.barMenu');
        client.pause(200);
        client.expect.element('#barMenuLeaveGame').to.be.present;
        client.expect.element('#barMenuLeaveGame').to.be.visible;
        client.expect.element('#barMenuLeaveGame').text.to.contain('Leave game');
        client.expect.element('#barMenuDisplayName').to.be.present;
        client.click('#barMenuDisplayName');

    },
    'User #1 - Answer question 1': answer(0,  false, true , 0.1),
    'User #2 - Answer question 1': answer(2,  true , false, 0.2),
    'User #1 - Leave game': function (client) {
        client.pause(500)
        client.switchWindow(windows[0]);
        client.click('.barMenu');
        client.pause(200);
        client.expect.element('#barMenuLeaveGame').to.be.present;
        client.expect.element('#barMenuLeaveGame').to.be.visible;
        client.expect.element('#barMenuLeaveGame').text.to.contain('Leave game');
        client.click('#barMenuLeaveGame');
        client.pause(1000);
        client.expect.element('#gameEndedDialogContent').to.be.present;
        client.expect.element('#gameEndedDialogContent').to.be.visible;
        client.expect.element('#gameEndedDialogUsername').to.be.present;
        client.expect.element('#gameEndedDialogUsername').to.be.visible;
        client.expect.element('#gameEndedDialogUsername').text.to.be.contain('New1 User1');
        client.click('#gameEndedDialogOk');
        client.pause(1000);
    },
    'User #2 - Verify left game': function (client) {
        client.switchWindow(windows[2]);
        client.pause(1000)
        client.expect.element('#gameEndedDialogContent').to.be.present;
        client.expect.element('#gameEndedDialogContent').to.be.visible;
        client.expect.element('#gameEndedDialogUsername').to.be.present;
        client.expect.element('#gameEndedDialogUsername').to.be.visible;
        client.expect.element('#gameEndedDialogUsername').text.to.be.contain('New1 User1');
        client.click('#gameEndedDialogOk');
        client.pause(1000);
    },
    'Lounge - second user after leaving': function (client) {
        client
            .switchWindow(windows[2])
            .assert.visible('.user div div div')
            .assert.containsText('.user div div div', 'New1 User1')
    },
    'Lounge - first user after leaving': function (client) {
        client
            .switchWindow(windows[0])
            .assert.visible('.user div div div')
            .assert.containsText('.user div div div', 'New2 User2')
            .pause(1000)
            .click('.user div div div')
            .pause(500)
            .assert.containsText('#outgoingInvitation', 'Invitation sent to New2 User2, waiting for reply.')
            .pause(500)
    },
    'Second user - refresh after leaving': function (client) {
        client.switchWindow(windows[2])
            .pause(1000)
            .assert.containsText('#incomingInvitation', 'Incoming invitation received from New1 User1.')
            .click('#incomingInvitationAccept')
            .pause(1000);
    },
    'User #1 - Answer question 1 after leaving': answer(0,  false, true , 0.1),
    'User #2 - Answer question 1 after leaving': answer(2,  true , false, 0.2),
    'User #1 - Answer question 2': answer(0,  true, true , 0.2),
    'User #2 - Answer question 2': answer(2,  false , false, 0.3),
    'User #1 - Answer question 3': answer(0,  false, true , 0.4),
    'User #2 - Answer question 3': answer(2,  true , false, 0.5),
    'User #1 - Answer question 4': answer(0,  false, true , 1),
    'User #2 - Answer question 4': answer(2,  true , false, 2),
    'User #1 - Answer question 5': answer(0,  false, true , 2),
    'User #2 - Answer question 5': answer(2,  true , false, 3),
    'Sudden refresh!': function (client) { client.refresh().pause(500); },
    'User #1 - Answer question 6': answer(0,  false, true , 1),
    'User #2 - Answer question 6': answer(2,  true , false, 11),
    'User #1 - Answer question 7': answer(0,  false, true , 0.1),
    'User #2 - Answer question 7': answer(2,  true , false, 0.1),
    'User #1 - Answer question 8': answer(0,  false, true , 0.1),
    'User #2 - Answer question 8': answer(2,  true , false, 0.1),
    'User #1 - Answer question 9': answer(0,  false, true , 0.1),
    'User #2 - Answer question 9': answer(2,  true , false, 0.1),
    'User #1 - Answer question 10': answer(0, true , true , 0.1),
    'User #2 - Answer question 10': answer(2, true , false, 0.1),
    'Game Ended - User 1': function (client) {
        client.switchWindow(windows[0]);
        client.pause(1000);
        client.expect.element('#winner').to.be.present;
        client.expect.element('#winner').text.to.contain('New2 User2');
        client.pause(1000);
        client.click('#gameEndedDialogOk');
    },
    'Game Ended - User 2': function (client) {
        client.switchWindow(windows[2]);
        client.pause(1000);
        client.expect.element('#winner').to.be.present;
        client.expect.element('#winner').text.to.contain('New2 User2');
        client.pause(1000);
        client.click('#gameEndedDialogOk');
    },
    after: function(client) {
        client.pause(1000).end();
    }
};