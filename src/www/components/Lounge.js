import React from 'react';
import { connect } from 'react-redux';
import { LOUNGE_ENTER_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';
import LoungeUserList from './LoungeUserList';
import OutgoingInvitation from './OutgoingInvitation';
import IncomingInvitation from './IncomingInvitation';
import { Link } from 'react-router';

class Lounge extends React.Component {
    componentWillMount() {
        this.props.dispatch(createApiAction(LOUNGE_ENTER_ACTIONS, '/lounge/enter'));
    }

    render() {
        let { invitation, game } = this.props;

        return (
            <div id="lounge">
                <LoungeUserList />
                <IncomingInvitation invitation={invitation} />
                <OutgoingInvitation invitation={invitation} />
                { game.gameId ? <Link id="gameLink" to="/game">Game</Link> : null }
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