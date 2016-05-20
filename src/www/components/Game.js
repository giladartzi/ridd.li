import React from 'react';
import { connect } from 'react-redux';
import last from 'lodash/last';
import GameProgress from './GameProgress';
import Question from './Question';

let Game = ({ game, answerPending }) => {
    let disabled = answerPending || last(game.progress).isAnswered;

    return (
        <div>
            <h1 id="gameHeader">Game</h1>
            <GameProgress />
            {game.question ? <Question disabled={disabled} game={game} /> : <div>Game has ended!</div>}
            {disabled ? <div id="waitingForOpponent">Question answered, waiting for opponent</div> : null}
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