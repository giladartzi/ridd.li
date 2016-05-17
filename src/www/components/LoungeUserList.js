import React from 'react';
import { connect } from 'react-redux';
import { INVITATION_SEND_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';

import {List, ListItem} from 'material-ui/List';
import ActionFace from 'material-ui/svg-icons/action/face';

let LoungeUserList = ({ users, invite }) => {
    let listItems = users.map(user => {
        return <ListItem className="user" key={user.id} primaryText={user.username}
            onClick={() => invite(user.id)} leftIcon={<ActionFace />} />;
    });

    return (
        <List>
            {listItems}
        </List>
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