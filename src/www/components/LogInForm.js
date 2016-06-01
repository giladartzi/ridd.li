import React from 'react';
import { connect } from 'react-redux';
import GenericForm from './GenericForm';
import { createApiAction, logInAppendix } from '../utils/utils';
import { LOG_IN_ACTIONS } from '../../common/consts';
import { Link } from 'react-router';

let LogInForm = ({onFormSubmit, error}) => {
    const fields = [
        { type: 'text', name: 'email' },
        { type: 'password', name: 'password' }
    ];
    
    const appendix = (
        <div>Don't have an account yet? <Link id="signUpLink" to="/signup">Sign up</Link></div>
    );

    return (
        <div>
            <GenericForm header="Login" fields={fields} onFormSubmit={onFormSubmit} error={error} appendix={appendix} />
        </div>

    );
};

let mapStateToProps = (state) => {
    return {
        error: state.user.error
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (payload) => {
            dispatch(createApiAction(LOG_IN_ACTIONS, '/login', payload, logInAppendix('user')));
        }
    };
};

LogInForm = connect(mapStateToProps, mapDispatchToProps)(LogInForm);

export default LogInForm;