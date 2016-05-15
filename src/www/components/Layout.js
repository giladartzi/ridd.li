import React from 'react';
import { connect } from 'react-redux';

let Layout = ({children}) => {
    return (
        <div>
            <h1>Header</h1>
            {children}
            <footer>Footer</footer>
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;