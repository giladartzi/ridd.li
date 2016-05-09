import questions from './defaultQuestions';
import * as dataLayer from './dataLayer';

(async function () {
    console.log(await dataLayer.drop('games'));
    console.log(await dataLayer.drop('questions'));
    console.log(await dataLayer.insert('questions', questions));
    process.exit(0);
})();