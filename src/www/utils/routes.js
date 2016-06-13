import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from '../components/Layout';
import SingUpForm from '../components/SingUpForm';
import LogInForm from '../components/LogInForm';
import Lounge from '../components/Lounge';
import Game from '../components/Game';

module.exports = (
    <Route path="/" component={Layout}>
        <IndexRoute component={LogInForm} />
        <Route path="/signup" component={SingUpForm} />
        <Route path="/lounge" component={Lounge} />
        <Route path="/game" component={Game} />
    </Route>
);


// <Route path="/" component={Layout}>
//     <IndexRoute component={LogInForm} onEnter={validateNonToken} />
//     <Route path="/signup" component={SingUpForm} onEnter={validateNonToken} />
//     <Route path="/lounge" component={Lounge} onEnter={validateToken} />
//     <Route path="/game" component={Game} onEnter={validateGame.bind(null, store.getState)} />
// </Route>