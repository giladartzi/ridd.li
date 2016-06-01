import React from 'react';
import { connect } from 'react-redux';
import { INVITATION_SEND_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';

import {List, ListItem} from 'material-ui/List';
import ActionFace from 'material-ui/svg-icons/action/face';
import Avatar from 'material-ui/Avatar';

let LoungeUserList = ({ users, invite }) => {
    let listItems = users.map(user => {
        return <ListItem
            className="user"
            key={user.id}
            primaryText={user.displayName}
            data-display-name={user.displayName}
            onClick={() => invite(user.id)}
            leftAvatar={user.picture ? <Avatar src={user.picture} /> : null}
            leftIcon={user.picture ? null : <ActionFace />} />;
    });

    let empty = (<div id="emptyLoungeUserList" style={{ textAlign: 'center', fontSize: '20px', padding: '20px' }}>
        Waiting for opponents to log in...
    </div>);

    return (
        listItems.length ? <List>{listItems}</List> : empty
    );
};

let mapStateToProps = (state) => {
    return {
        users: state.lounge.users || []
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        invite: (opponentId) => {
            dispatch(createApiAction(INVITATION_SEND_ACTIONS, '/invitation/send', { opponentId }));
        }
    };
};

LoungeUserList = connect(mapStateToProps, mapDispatchToProps)(LoungeUserList);

export default LoungeUserList;