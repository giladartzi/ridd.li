import uniq from 'lodash/uniq';
import first from 'lodash/first';
import without from 'lodash/without';
import sample from 'lodash/sample';
import questions from './../defaultQuestions';
import chalk from 'chalk';

export function getAnswerIndex(question, correct) {
    let filtered = first(questions.filter(q => q.text === question.text));
    let answer = first(filtered.answers.filter(a => a.isCorrect)).text;
    let correctIndex = question.answers.indexOf(answer);
    if (correct) {
        return correctIndex;
    }
    else {
        let arr = [];
        question.answers.forEach((value, index) => arr.push(index));
        return sample(without(arr, correctIndex));
    }
}

export function assertEqual(a, b, msg) {
    if (a !== b) {
        console.error(chalk.red('[   Fail]'), msg, a, b);
        return false;
    }

    return true;
}

export function verifyBatch(name, batch) {
    let unique = uniq(batch);
    let result = unique.length === 1 && unique[0] === true;
    let prefix;

    if (result) {
        prefix = chalk.green('[Success]');
    }
    else {
        prefix = chalk.red('[###Fail]');
    }
    console.log(prefix, name);

    return result;
}