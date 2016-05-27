import React from 'react';
import { connect } from 'react-redux';
import { LOUNGE_ENTER_ACTIONS } from '../../common/consts';
import { createApiAction } from '../utils/utils';
import LoungeUserList from './LoungeUserList';
import OutgoingInvitation from './OutgoingInvitation';
import IncomingInvitation from './IncomingInvitation';
import { push } from 'react-router-redux';

class Lounge extends React.Component {
    componentWillMount() {
        this.props.dispatch(createApiAction(LOUNGE_ENTER_ACTIONS, '/lounge/enter'));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.game.gameId) {
            this.props.dispatch(push('/game'));
        }
    }

    render() {
        let { invitation } = this.props;

        return (
            <div id="lounge">
                <LoungeUserList />
                <IncomingInvitation invitation={invitation} />
                <OutgoingInvitation invitation={invitation} />
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