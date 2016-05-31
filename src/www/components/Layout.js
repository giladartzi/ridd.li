import React from 'react';
import { connect } from 'react-redux';
import Bar from './Bar';
import Riddli from './Riddli';
import LinearProgress from 'material-ui/LinearProgress';
import { NUM_OF_QUESTIONS, ACTIVE } from '../../common/consts';

let Layout = ({ children, game, inGame }) => {
    if (game.progress) {
        var progress = (100 * game.progress.length) / NUM_OF_QUESTIONS;
    }

    return (
        <div>
            { localStorage.token ? <Bar /> : null }
            { localStorage.token ? null : <div id="mainHeader"><Riddli scale="0.3" /></div> }
            { inGame ? <LinearProgress mode="determinate" value={progress} /> : null }

            <div id="layoutWrapper">
                {children}
            </div>
        </div>
    );
};

let mapStateToProps = (state) => {
    return {
        game: state.game,
        inGame: state.game.gameId && state.game.state === ACTIVE
    };
};

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;