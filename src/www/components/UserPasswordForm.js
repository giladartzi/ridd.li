import React from 'react';

export default class UserPasswordForm extends React.Component {
    constructor(params) {
        super(params);
        
        this.onSubmit = this.onSubmit.bind(this);
    }

    onUsernameChange(e) {
        this.setState({
            username: e.currentTarget.value
        });
    }

    onPasswordChange(e) {
        this.setState({
            password: e.currentTarget.value
        });
    }

    onSubmit(e) {
        e.preventDefault();
        
        this.props.onFormSubmit(this.state.username, this.state.password);
    }

    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type="text" name="username" placeholder="Username" onChange={this.onUsernameChange.bind(this)} />
                <input type="password" name="password" placeholder="Password" onChange={this.onPasswordChange.bind(this)} />
                <button type="submit">Submit</button>
                { this.props.error ? <span>{this.props.error}</span> : null }
            </form>
        );
    }
}