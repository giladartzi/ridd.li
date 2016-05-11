import * as server from './../server';
import userTests from './userTests';
import loungeTests from './loungeTests';
import gameTests from './gameTests';
import invitationTests from './invitationTests';

async function tests() {
    try {
        let { tokens, userIds } = await userTests();
        await loungeTests(tokens, userIds);
        await invitationTests(tokens, userIds);
        //await gameTests(tokens, userIds);
    }
    catch (e) {
        console.log(e);
    }


    process.exit(0);
}

tests();