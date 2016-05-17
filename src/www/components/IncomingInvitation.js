import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { INVITATION_ACCEPT_ACTIONS, INVITATION_REJECT_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';

let IncomingInvitation = ({invitation, acceptInvitation, rejectInvitation}) => {
    let isIncoming = invitation.id && invitation.state === 'PENDING' && invitation.invitee.id === localStorage.userId;
    let inviter = isIncoming && invitation.inviter.username;

    const actions = [
        <FlatButton id="incomingInvitationReject" label="Reject" onClick={rejectInvitation} />,
        <FlatButton id="incomingInvitationAccept" label="Accept" onClick={acceptInvitation} />
    ];

    return (
        <Dialog title="Incoming invitation" actions={actions} modal={true} open={!!inviter}>
            <div id="incomingInvitation">Incoming invitation received from {inviter}.</div>
        </Dialog>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = (dispatch) => {
    return {
        acceptInvitation: () => {
            dispatch(createApiAction(INVITATION_ACCEPT_ACTIONS, '/invitation/accept'));
        },
        rejectInvitation: () => {
            dispatch(createApiAction(INVITATION_REJECT_ACTIONS, '/invitation/reject'));
        }
    };
};

IncomingInvitation = connect(mapStateToProps, mapDispatchToProps)(IncomingInvitation);

export default IncomingInvitation;