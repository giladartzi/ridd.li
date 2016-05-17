import React from 'react';
import { connect } from 'react-redux';
import GameProgressBadge from './GameProgressBadge';

let GameProgress = ({progress}) => {
    let badges = progress.map((p, index) => {
        return <GameProgressBadge isCurrent={index === progress.length-1} index={index} {...p} />;
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