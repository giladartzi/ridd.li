import React from 'react';
import { connect } from 'react-redux';
import UserPasswordForm from './UserPasswordForm';
import { createApiAction } from '../utils/utils';
import { AUTHENTICATE_ACTIONS } from '../../common/consts';

let AuthenticateForm = ({onFormSubmit, error}) => {
    return (
        <UserPasswordForm onFormSubmit={onFormSubmit} error={error} />
    );
};

let mapStateToProps = (state) => {
    return {
        error: state.authenticate.error
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (username, password) => {
            dispatch(createApiAction(AUTHENTICATE_ACTIONS, '/authenticate', { username, password }));
        }
    };
};

AuthenticateForm = connect(mapStateToProps, mapDispatchToProps)(AuthenticateForm);

export default AuthenticateForm;