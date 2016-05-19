import React from 'react';
import { connect } from 'react-redux';
import Bar from './Bar';

let Layout = ({children}) => {
    return (
        <div>
            <Bar />
            {children}
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;