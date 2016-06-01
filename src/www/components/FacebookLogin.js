import React from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import { checkFacebookLogInStatus, logInToFacebook } from '../utils/fbUtils';
import { createApiAction, logInAppendix } from '../utils/utils';
import { FB_LOG_IN_ACTIONS } from '../../common/consts';
import SvgIcon from 'material-ui/SvgIcon';

class FacebookLogin extends React.Component {
    async onClick() {
        let fbResponse = await checkFacebookLogInStatus();

        if (fbResponse.status !== 'connected') {
            fbResponse = await logInToFacebook();
        }

        let authResponse = fbResponse.authResponse;
        this.props.fbLogin(authResponse.userID, authResponse.accessToken);
    }

    render() {
        let icon = <SvgIcon viewBox="0 1 24 24">
                <path d="M19,4V7H17A1,1 0 0,0 16,8V10H19V13H16V20H13V13H11V10H13V7.5C13,5.56 14.57,4 16.5,4M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z" />
        </SvgIcon>;

        return (
            <RaisedButton id="fbLogIn" icon={icon} label="Login with Facebook" onClick={this.onClick.bind(this)} primary={true} />
        );
    }
}

let mapStateToProps = null;

let mapDispatchToProps = (dispatch) => {
    return {
        fbLogin: (fbUserId, fbAccessToken) => {
            let appendix = logInAppendix('user');
            dispatch(createApiAction(FB_LOG_IN_ACTIONS, '/fbLogin', { fbUserId, fbAccessToken }, appendix));
        }
    };
};

FacebookLogin = connect(mapStateToProps, mapDispatchToProps)(FacebookLogin);

export default FacebookLogin;