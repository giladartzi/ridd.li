import React from 'react';
import { connect } from 'react-redux';
import GenericForm from './GenericForm';
import { createApiAction, logInAppendix } from '../utils/utils';
import { SIGN_UP_ACTIONS } from '../../common/consts';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

let SignUpForm = ({onFormSubmit, error}) => {
    const fields = [
        { type: 'email', name: 'email' },
        { type: 'text', name: 'firstName', placeholder: 'First Name' },
        { type: 'text', name: 'lastName', placeholder: 'Last Name' },
        { type: 'password', name: 'password' }
    ];

    const appendix = (
        <div>Already have an account? <Link id="logInLink" to="/">Log in</Link></div>
    );

    return (
        <GenericForm header="Sign up" className="signUp" appendix={appendix}
            fields={fields} onFormSubmit={onFormSubmit} error={error} />
    );
};

let mapStateToProps = (state) => {
    return {
        error: state.signUp.error
    };
};

let actionCreator = (payload) => {
    return createApiAction(SIGN_UP_ACTIONS, '/signup', payload, logInAppendix());
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (payload) => {
            dispatch(actionCreator(payload));
        }
    };
};

SignUpForm = connect(mapStateToProps, mapDispatchToProps)(SignUpForm);

export default SignUpForm;