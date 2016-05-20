import React from 'react';
import { connect } from 'react-redux';
import GameProgressBadge from './GameProgressBadge';
import { NUM_OF_QUESTIONS } from '../../common/consts';

let GameProgress = ({progress}) => {
    let padded = [...progress];

    while (padded.length < NUM_OF_QUESTIONS) {
        padded.push({});
    }

    let badges = padded.map((p, index) => {
        return <GameProgressBadge key={index} isCurrent={index === progress.length-1} index={index+1} {...p} />;
    });

    return (
        <div>{badges}</div>
    );
};

let mapStateToProps = (state) => {
    return {
        progress: state.game.progress
    };
};

let mapDispatchToProps = null;

GameProgress = connect(mapStateToProps, mapDispatchToProps)(GameProgress);

export default GameProgress;