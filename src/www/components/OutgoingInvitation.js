import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { createApiAction } from '../utils/utils';
import { INVITATION_CANCEL_ACTIONS } from '../../common/consts';

let OutgoingInvitation = ({invitation, cancel}) => {
    let isOutgoing = invitation.id && invitation.state === 'PENDING' && invitation.inviter.id === localStorage.userId;
    let invitee = isOutgoing && invitation.invitee.displayName;

    const actions = [
        <FlatButton id="outgoingInvitationCancel" label="Cancel" onClick={cancel} />
    ];

    return (
        <Dialog title="Outgoing invitation" actions={actions} modal={true} open={!!invitee}>
            <div id="outgoingInvitation">Invitation sent to {invitee}, waiting for reply.</div>
        </Dialog>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = (dispatch) => {
    return {
        cancel: () => {
            dispatch(createApiAction(INVITATION_CANCEL_ACTIONS, '/invitation/cancel'));
        }
    };
};

OutgoingInvitation = connect(mapStateToProps, mapDispatchToProps)(OutgoingInvitation);

export default OutgoingInvitation;