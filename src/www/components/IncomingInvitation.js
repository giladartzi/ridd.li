import React from 'react';
import { connect } from 'react-redux';
import { INVITATION_ACCEPT_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';

let IncomingInvitation = ({invitation, acceptInvitation}) => {
    let isIncoming = invitation.id && invitation.invitee.id === localStorage.userId;
    let inviter;

    if (isIncoming) {
        inviter = invitation.inviter;
        return (
            <div onClick={() => acceptInvitation()}>
                {`Incoming invitation from ${inviter.username}`}
            </div>
        );
    }
    
    return null;
};

let mapStateToProps = null;

let mapDispatchToProps = (dispatch) => {
    return {
        acceptInvitation: () => {
            dispatch(createApiAction(INVITATION_ACCEPT_ACTIONS, '/invitation/accept'));
        }
    };
};

IncomingInvitation = connect(mapStateToProps, mapDispatchToProps)(IncomingInvitation);

export default IncomingInvitation;