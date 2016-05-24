import questions from '../common/defaultQuestions';
import * as dataLayer from './dataLayer';

(async function () {
    await dataLayer.insert('invitations', { a: 1 });
    await dataLayer.drop('invitations');
    await dataLayer.insert('users', { a: 1 });
    await dataLayer.drop('users');
    await dataLayer.insert('games', { a: 1 });
    await dataLayer.drop('games');
    await dataLayer.drop('questions');
    await dataLayer.insert('questions', questions);

    process.exit(0)
})();