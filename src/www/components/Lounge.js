import React from 'react';
import { connect } from 'react-redux';
import { LOUNGE_ENTER_ACTIONS, INVITATION_SEND_ACTIONS } from '../../common/consts';
import { createApiAction, createApiActionGet } from '../utils/utils';
import OutgoingInvitation from './OutgoingInvitation';
import IncomingInvitation from './IncomingInvitation';

class Lounge extends React.Component {
    componentWillMount() {
        this.props.dispatch(createApiAction(LOUNGE_ENTER_ACTIONS, '/lounge/enter'));
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
                <IncomingInvitation invitation={this.props.invitation} />
                <OutgoingInvitation invitation={this.props.invitation} />
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        users: state.lounge.users || [],
        invitation: state.invitation
    };
};

let mapDispatchToProps = null;

Lounge = connect(mapStateToProps, mapDispatchToProps)(Lounge);

export default Lounge;