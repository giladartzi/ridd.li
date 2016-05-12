import React from 'react';
import { post } from '../common/rest';

export default class Form extends React.Component {
    constructor(params) {
        super(params);
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

    async onSubmit(e) {
        e.preventDefault();
        console.log(this.state);

        let res = await post('/register', this.state, null);
        console.log(res);
    }

    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type="text" name="username" placeholder="Username" onChange={this.onUsernameChange.bind(this)} />
                <input type="password" name="password" placeholder="Password" onChange={this.onPasswordChange.bind(this)} />
                <button type="submit">Submit</button>
            </form>
        );
    }
}