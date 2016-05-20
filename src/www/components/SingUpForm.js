import React from 'react';
import { connect } from 'react-redux';
import GenericForm from './GenericForm';
import { createApiAction } from '../utils/utils';
import { REGISTER_ACTIONS } from '../../common/consts';
import { push } from 'react-router-redux';

let RegisterForm = ({onFormSubmit, error}) => {
    const fields = [
        { type: 'email', name: 'email' },
        { type: 'text', name: 'username' },
        { type: 'password', name: 'password' }
    ];

    return (
        <GenericForm header="Sign up" className="signUp"
            fields={fields} onFormSubmit={onFormSubmit} error={error} />
    );
};

let mapStateToProps = (state) => {
    return {
        error: state.register.error
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

    return createApiAction(REGISTER_ACTIONS, '/register', payload, appendix);
};

let mapDispatchToProps = (dispatch) => {
    return {
        onFormSubmit: (payload) => {
            dispatch(actionCreator(payload));
        }
    };
};

RegisterForm = connect(mapStateToProps, mapDispatchToProps)(RegisterForm);

export default RegisterForm;