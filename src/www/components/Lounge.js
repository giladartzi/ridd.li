import React from 'react';
import { connect } from 'react-redux';
import { LOUNGE_ENTER_ACTIONS, INVITATION_SEND_ACTIONS, INVITATION_GET_ACTIONS } from '../../common/consts';
import { createApiAction, createApiActionGet } from '../utils/utils';

class Lounge extends React.Component {
    componentWillMount() {
        this.props.dispatch(createApiAction(LOUNGE_ENTER_ACTIONS, '/lounge/enter'));

        this.interval = setTimeout(() => {
            this.props.dispatch(createApiActionGet(INVITATION_GET_ACTIONS, '/invitation'));
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    invite(opponentId) {
        this.props.dispatch(createApiAction(INVITATION_SEND_ACTIONS, '/invitation/send', { opponentId }));
    }

    render() {
        let users = this.props.users.map(user => {
            return <div key={user.id} onClick={() => this.invite(user.id)}>
                {user.username}
            </div>
        });

        let { incomingInvitation, outgoingInvitation } = this.props;

        return (
            <div>
                <h1>Lounge</h1>
                {users}
                {incomingInvitation ? <div>{`Incoming invitation from ${incomingInvitation}`}</div> : null}
                {outgoingInvitation ? <div>{`Outgoing invitation to ${outgoingInvitation}`}</div> : null}
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        users: state.lounge.users || [],
        incomingInvitation: (state.invitation.id && state.invitation.invitee.id === localStorage.userId) ? state.invitation.inviter.username : null,
        outgoingInvitation: (state.invitation.id && state.invitation.inviter.id === localStorage.userId) ? state.invitation.invitee.username : null
    };
};

let mapDispatchToProps = null;

Lounge = connect(mapStateToProps, mapDispatchToProps)(Lounge);

export default Lounge;