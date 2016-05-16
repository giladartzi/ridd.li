import React from 'react';
import { connect } from 'react-redux';
import { createApiAction } from '../utils/utils';
import { ANSWER_ACTIONS } from '../../common/consts';

let Game = ({game, sendAnswer}) => {
    let answers = game.question.answers.map((answer, index) => {
        return <li id={`answer${index}`} key={index} onClick={() => sendAnswer(game.gameId, game.questionIndex, index)}>{answer}</li>
    });
    
    return (
        <div>
            <h1 id="gameHeader">Game</h1>
            <div id="question">{ game.question.text }</div>
            <ul>
                {answers}
            </ul>
        </div>
    );
};

let mapStateToProps = (state) => {
    return {
        game: state.game
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        sendAnswer: (gameId, questionIndex, answerIndex) => {
            dispatch(createApiAction(ANSWER_ACTIONS, '/answer', { gameId, questionIndex, answerIndex }));
        }
    };
};

Game = connect(mapStateToProps, mapDispatchToProps)(Game);

export default Game;