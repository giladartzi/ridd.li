import React from 'react';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';

let Layout = ({children}) => {
    return (
        <div>
            <AppBar title="ridd.li" />
            {children}
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;