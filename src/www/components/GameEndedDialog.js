import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import { push } from 'react-router-redux';
import FlatButton from 'material-ui/FlatButton';
import { INACTIVE } from '../../common/consts';

let GameEndedDialog = ({ isOpen, endedByUsername, winnerUsername, closeDialog }) => {
    const actions = [
        <FlatButton id="gameEndedDialogOk" label="OK" onClick={closeDialog} />
    ];

    return (
        <Dialog title="Game has ended" actions={actions} modal={true} open={isOpen}>
            <div id="gameEndedDialogContent">
                Game has ended!
                { winnerUsername ? <div>
                    The winner is: <span id="winner">{winnerUsername}</span>.
                </div> : null }
                { endedByUsername ? <div>
                    Ended by: <span id="gameEndedDialogUsername">{endedByUsername}</span>
                </div> : null }
            </div>
        </Dialog>
    );
};

let mapStateToProps = (state) => {
    return {
        isOpen: state.game.state === INACTIVE,
        endedByUsername: state.game.endedBy && state.game.endedBy.displayName,
        winnerUsername: state.game.winner && state.game.winner.displayName
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        closeDialog: () => {
            dispatch(push('/lounge'));
        }
    };
};

GameEndedDialog = connect(mapStateToProps, mapDispatchToProps)(GameEndedDialog);

export default GameEndedDialog;