import React from 'react';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Riddli from './Riddli';

let Bar = ({ logout }) => {
    let menu = (
        <IconMenu
            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            className="barMenu"
        >
            <MenuItem id="barMenuUsername" primaryText={localStorage.username} />
            <MenuItem id="barMenuLogout" primaryText="Log out" onClick={() => logout()} />
        </IconMenu>
    );
    
    return <AppBar title={<Riddli scale="0.1" fill="white" />} showMenuIconButton={false} iconElementRight={ menu } />;
};

let mapStateToProps = (state) => {
    return {
        pathname: state.routing.locationBeforeTransitions.pathname
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        logout: function () {
            localStorage.clear();
            window.location.href = '/';
        }
    };
};

Bar = connect(mapStateToProps, mapDispatchToProps)(Bar);

export default Bar;