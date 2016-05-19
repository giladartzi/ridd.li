import React from 'react';
import { connect } from 'react-redux';
import GameProgress from './GameProgress';
import Question from './Question';

let Game = ({ game }) => {
    return (
        <div>
            <h1 id="gameHeader">Game</h1>
            <GameProgress />
            {game.question ? <Question game={game} /> : <div>Game has ended!</div>}

        </div>
    );
};

let mapStateToProps = (state) => {
    return {
        game: state.game
    };
};

let mapDispatchToProps = null;

Game = connect(mapStateToProps, mapDispatchToProps)(Game);

export default Game;