import React from 'react';
import { connect } from 'react-redux';
import UserPasswordForm from './UserPasswordForm';
import { createApiAction } from '../utils/utils';
import { REGISTER_ACTIONS } from '../../common/consts';

let RegisterForm = ({onFormSubmit, error}) => {
    return (
        <UserPasswordForm onFormSubmit={onFormSubmit} error={error} />
    );
};

let mapStateToProps = (state) => {
    return {
        error: state.register.error
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (username, password) => {
            dispatch(createApiAction(REGISTER_ACTIONS, '/register', { username, password }));
        }
    };
};

RegisterForm = connect(mapStateToProps, mapDispatchToProps)(RegisterForm);

export default RegisterForm;