import * as server from './../server';
import userTests from './userTests';
import loungeTests from './loungeTests';
import gameTests from './gameTests';
import invitationTests from './invitationTests';

async function tests() {
    try {
        let { tokens, userIds, wss } = await userTests();
        await loungeTests(tokens, userIds, wss);
        let { gameId, currentQuestion } = await invitationTests(tokens, userIds, wss);
        await gameTests(tokens, userIds, gameId, currentQuestion);
    }
    catch (e) {
        console.log(e, e.stack.split('\n'));
    }


    process.exit(0);
}

tests();