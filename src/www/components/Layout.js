import React from 'react';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router';

let Layout = ({children}) => {
    let signInButton = <FlatButton label="Sign in" />;
    //let signInButton = <Link to="/login"><FlatButton label="Sign in" /></Link>;

    return (
        <div>
            <AppBar title="ridd.li" iconElementRight={ signInButton } />

            {children}
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;