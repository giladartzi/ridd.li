import React from 'react';
import { connect } from 'react-redux';
import { LOUNGE_ENTER_ACTIONS, INVITATION_SEND_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';
import OutgoingInvitation from './OutgoingInvitation';
import IncomingInvitation from './IncomingInvitation';
import { Link } from 'react-router';

class Lounge extends React.Component {
    componentWillMount() {
        this.props.dispatch(createApiAction(LOUNGE_ENTER_ACTIONS, '/lounge/enter'));
    }

    invite(opponentId) {
        this.props.dispatch(createApiAction(INVITATION_SEND_ACTIONS, '/invitation/send', { opponentId }));
    }

    render() {
        let users = this.props.users.map(user => {
            return <div className="user" key={user.id} onClick={() => this.invite(user.id)}>
                {user.username}
            </div>
        });

        let { invitation, game } = this.props;

        return (
            <div id="lounge">
                <h1>Lounge</h1>
                <div id="welcome">Logged in as <span id="username">{localStorage.username}</span></div>
                {users}
                <IncomingInvitation invitation={invitation} />
                <OutgoingInvitation invitation={invitation} />
                { game.gameId ? <Link id="gameLink" to="/game">Game</Link> : null }
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        users: state.lounge.users || [],
        invitation: state.invitation,
        game: state.game
    };
};

let mapDispatchToProps = null;

Lounge = connect(mapStateToProps, mapDispatchToProps)(Lounge);

export default Lounge;