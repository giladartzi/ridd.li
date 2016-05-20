import React from 'react';
import { connect } from 'react-redux';
import GenericForm from './GenericForm';
import { createApiAction } from '../utils/utils';
import { AUTHENTICATE_ACTIONS } from '../../common/consts';
import { push } from 'react-router-redux';

let AuthenticateForm = ({onFormSubmit, error}) => {
    const fields = [
        { type: 'text', name: 'username' },
        { type: 'password', name: 'password' }
    ];

    return (
        <GenericForm header="Login" fields={fields} onFormSubmit={onFormSubmit} error={error} />
    );
};

let mapStateToProps = (state) => {
    return {
        error: state.authenticate.error
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

    return createApiAction(AUTHENTICATE_ACTIONS, '/authenticate', payload, appendix);
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (payload) => {
            dispatch(actionCreator(payload));
        }
    };
};

AuthenticateForm = connect(mapStateToProps, mapDispatchToProps)(AuthenticateForm);

export default AuthenticateForm;