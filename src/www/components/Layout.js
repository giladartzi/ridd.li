import React from 'react';
import { connect } from 'react-redux';
import Bar from './Bar';

let Layout = ({children}) => {
    return (
        <div>
            { localStorage.token ? <Bar /> : null }
            { localStorage.token ? null : <h1 id="mainHeader">ridd.li</h1> }

            {children}
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;