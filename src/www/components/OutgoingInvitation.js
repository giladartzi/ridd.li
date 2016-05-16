import React from 'react';

let OutgoingInvitation = ({invitation}) => {
    let isOutgoing = invitation.id && invitation.inviter.id === localStorage.userId;
    let invitee;
    
    if (isOutgoing) {
        invitee = invitation.invitee.username;
        return <div id="outgoingInvitation">{`Outgoing invitation to ${invitee}`}</div>;
    }

    return null;
};

export default OutgoingInvitation;