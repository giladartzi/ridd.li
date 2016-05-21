import React from 'react';
import { connect } from 'react-redux';
import Bar from './Bar';
import Riddli from './Riddli';

let Layout = ({children}) => {
    return (
        <div>
            { localStorage.token ? <Bar /> : null }
            { localStorage.token ? null : <div id="mainHeader"><Riddli scale="0.3" /></div> }

            {children}
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = null;

Layout = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default Layout;