import React from 'react';
import { connect } from 'react-redux';
import GenericForm from './GenericForm';
import { createApiAction } from '../utils/utils';
import { LOG_IN_ACTIONS } from '../../common/consts';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

let LogInForm = ({onFormSubmit, error}) => {
    const fields = [
        { type: 'text', name: 'username' },
        { type: 'password', name: 'password' }
    ];
    
    const appendix = (
        <div>Don't have an account yet? <Link id="signUpLink" to="/signup">Sign up</Link></div>
    );

    return (
        <GenericForm header="Login" fields={fields} onFormSubmit={onFormSubmit} error={error} appendix={appendix} />

    );
};

let mapStateToProps = (state) => {
    return {
        error: state.logIn.error
    };
};

let actionCreator = (payload) => {
    let appendix = {
        onSuccess: (res, dispatch) => {
            localStorage.token = res.json.token;
            localStorage.userId = res.json.id;
            localStorage.username = res.json.username;
            dispatch(push('/lounge'));
        }
    };

    return createApiAction(LOG_IN_ACTIONS, '/login', payload, appendix);
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (payload) => {
            dispatch(actionCreator(payload));
        }
    };
};

LogInForm = connect(mapStateToProps, mapDispatchToProps)(LogInForm);

export default LogInForm;