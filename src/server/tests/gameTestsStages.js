import { NUM_OF_QUESTIONS, QUESTION_TIMEOUT } from '../../common/consts';
import minBy from 'lodash/minBy';
import find from 'lodash/find';
import last from 'lodash/last';

let stages = [
    [
        { userIndex: 0, questionIndex: 0, isCorrect: true, wait: 0.1 },
        { userIndex: 1, questionIndex: 0, isCorrect: true, wait: 0.2 }
    ],
    [
        { userIndex: 0, questionIndex: 1, isCorrect: false, wait: 0.2 },
        { userIndex: 1, questionIndex: 1, isCorrect: false, wait: 0.1 }
    ],
    [
        { userIndex: 0, questionIndex: 1, isCorrect: true, wait: 0.1 },
        { userIndex: 1, questionIndex: 2, isCorrect: true, wait: 0.2 }
    ],
    [
        { userIndex: 0, questionIndex: 2, isCorrect: true, wait: 0.2 },
        { userIndex: 1, questionIndex: 2, isCorrect: true, wait: 0.1 }
    ],
    [
        { userIndex: 0, questionIndex: 3, isCorrect: true, wait: 0.2 },
        { userIndex: 1, questionIndex: 3141592, isCorrect: true, wait: 0.1 }
    ],
    [
        { userIndex: 0, questionIndex: 2718281, isCorrect: true, wait: 0.1 },
        { userIndex: 1, questionIndex: 3, isCorrect: true, wait: 0.4 }
    ],
    [
        { userIndex: 0, questionIndex: 4, isCorrect: false, wait: 1 },
        { userIndex: 1, questionIndex: 4, isCorrect: true, wait: 0.2 }
    ],
    [
        { userIndex: 0, questionIndex: 5, isCorrect: true, wait: 0.01 },
        { userIndex: 1, questionIndex: 5, isCorrect: false, wait: 2 }
    ],
    [
        { userIndex: 0, questionIndex: 6, isCorrect: true, wait: 1 },
        { userIndex: 1, questionIndex: 6, isCorrect: false, wait: 2 }
    ],
    [
        { userIndex: 0, questionIndex: 7, isCorrect: true, wait: 8 },
        { userIndex: 1, questionIndex: 7, isCorrect: false, wait: 5 }
    ],
    [
        { userIndex: 0, questionIndex: 8, isCorrect: true, wait: 13 },
        { userIndex: 1, questionIndex: 8, isCorrect: false, wait: 5 }
    ],
    [
        { userIndex: 0, questionIndex: 9, isCorrect: true, wait: 1 },
        { userIndex: 1, questionIndex: 9, isCorrect: false, wait: 15 }
    ]
];

let answered = [[], []];

export function getOpponentMove(move) {
    let moves = find(stages, stage => stage.indexOf(move) !== -1);
    return find(moves, m => m !== move);
}

function getAnswerCount(move) {
    let moves = stages.map(stage => find(stage, m => m.userIndex === move.userIndex));
    let previousMoves = moves.slice(0, moves.indexOf(move));
    let answers = previousMoves.filter(m => !m.hasError);
    return answers.length;
}

function expectedProgressLength(move, originalMove) {
    let result;
    let answerCount = getAnswerCount(move);
    let opponentAnswerCount = getAnswerCount(getOpponentMove(move));

    if (!move.hasError && !move.onlyOneToAnswer) {
        // regular move, both players answer
        result = originalMove.isFirstToAnswer ? answerCount + 1 : answerCount + 2;
    }
    else if (!move.hasError && answerCount !== opponentAnswerCount) {
        result = answerCount + 2;
    }
    else {
        // only one user answered, meaning progression stops
        result = answerCount + 1;
    }

    return Math.min(result, NUM_OF_QUESTIONS);
}

function expectedQuestionIndex(move, opponentMove) {
    let result = Math.max(getAnswerCount(move), getAnswerCount(opponentMove));

    if (!move.hasError && !opponentMove.hasError && !move.isFirstToAnswer) {
        result += 1;
    }

    return result;
}

stages.forEach(moves => {
    moves.forEach(move => {
        move.badQuestionIndex = move.questionIndex < 0 || move.questionIndex >= NUM_OF_QUESTIONS;
        move.isTimedOut = move.wait >= QUESTION_TIMEOUT;
        move.alreadyAnswered = answered[move.userIndex].indexOf(move.questionIndex) !== -1;
        answered[move.userIndex].push(move.questionIndex);
        move.isFirstToAnswer = minBy(moves, 'wait') === move;
        move.hasError = move.alreadyAnswered || move.badQuestionIndex;
    });

    moves.forEach(move => {
        let opponentMove = getOpponentMove(move);
        move.onlyOneToAnswer = !move.hasError && opponentMove.hasError;
        move.expectedProgressLength = expectedProgressLength(move, move);
        move.expectedOpponentProgressLength = expectedProgressLength(opponentMove, move);
        move.expectedQuestionIndex = expectedQuestionIndex(move, opponentMove);
        move.expectedState = moves === last(stages) && !move.isFirstToAnswer ? 'INACTIVE' : 'ACTIVE';
    });
});

export default stages;