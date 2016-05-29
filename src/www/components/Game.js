import React from 'react';
import { connect } from 'react-redux';
import last from 'lodash/last';
import GameProgress from './GameProgress';
import Question from './Question';
import GameEndedDialog from './GameEndedDialog';
import LinearProgress from 'material-ui/LinearProgress';
import { NUM_OF_QUESTIONS } from '../../common/consts';

let Game = ({ game, answerPending }) => {
    let isAnswered = last(game.progress).isAnswered;
    let disabled = answerPending || isAnswered;

    return (
        <div>
            <LinearProgress mode="determinate" value={(100 * game.progress.length) / NUM_OF_QUESTIONS} />
            <GameProgress progress={game.progress} />
            <GameProgress progress={game.opponentProgress} />
            {game.question ? <Question disabled={disabled} game={game} /> : <div>Game has ended!</div>}
            {isAnswered ? <div id="waitingForOpponent">Question answered, waiting for opponent</div> : null}
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