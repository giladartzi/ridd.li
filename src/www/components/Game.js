import React from 'react';
import { connect } from 'react-redux';
import { createApiAction } from '../utils/utils';
import { ANSWER_ACTIONS } from '../../common/consts';
import GameProgress from './GameProgress';
import {List, ListItem} from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';

let Game = ({game, sendAnswer}) => {
    let answers = game.question.answers.map((answer, index) => {
        return (
            <ListItem id={`answer${index}`} key={index} primaryText={answer} leftIcon={<ActionInfo />}
                      onClick={() => sendAnswer(game.gameId, game.questionIndex, index)} />
        );

    });
    
    return (
        <div>
            <h1 id="gameHeader">Game</h1>
            <GameProgress />
            <div id="question">{ game.question.text }</div>
            <List>
                {answers}
            </List>
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