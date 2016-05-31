import React from 'react';
import { connect } from 'react-redux';
import last from 'lodash/last';
import GameProgress from './GameProgress';
import Question from './Question';
import GameEndedDialog from './GameEndedDialog';


let Game = ({ game, answerPending }) => {
    let isAnswered = last(game.progress).isAnswered;
    let disabled = answerPending || isAnswered;

    return (
        <div>
            <GameProgress progress={game.progress} />
            <GameProgress progress={game.opponentProgress} />
            {
                game.question ?
                <Question disabled={disabled} isAnswered={isAnswered} game={game} /> :
                <div>Game has ended!</div>
            }
            <GameEndedDialog />
        </div>
    );
};

let mapStateToProps = (state) => {
    return {
        game: state.game,
        answerPending: state.answer.pending
    };
};

let mapDispatchToProps = null;

Game = connect(mapStateToProps, mapDispatchToProps)(Game);

export default Game;