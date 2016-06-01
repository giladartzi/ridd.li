import React from 'react';
import { connect } from 'react-redux';
import { LOUNGE_ENTER_ACTIONS, ACTIVE } from '../../common/consts';
import { createApiAction } from '../utils/utils';
import LoungeUserList from './LoungeUserList';
import OutgoingInvitation from './OutgoingInvitation';
import IncomingInvitation from './IncomingInvitation';
import { push } from 'react-router-redux';

class Lounge extends React.Component {
    componentWillMount() {
        // In case that a game is in progress, forward the user to '/game' path.
        if (this.props.game.gameId && this.props.game.state === ACTIVE) {
            this.props.dispatch(push('/game'));
        }
        this.props.dispatch(createApiAction(LOUNGE_ENTER_ACTIONS, '/lounge/enter'));
    }

    componentWillReceiveProps(nextProps) {
        // In case that a game is in progress, forward the user to '/game' path.
        if (nextProps.game.gameId && nextProps.game.state === ACTIVE) {
            this.props.dispatch(push('/game'));
        }
    }

    render() {
        let { invitation } = this.props;

        return (
            <div id="lounge">
                <LoungeUserList />
                <IncomingInvitation invitation={invitation} />
                <OutgoingInvitation invitation={invitation} />
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        invitation: state.invitation,
        game: state.game
    };
};

let mapDispatchToProps = null;

Lounge = connect(mapStateToProps, mapDispatchToProps)(Lounge);

export default Lounge;