import React from 'react';
import capitalize from 'lodash/capitalize';

export default class UserPasswordForm extends React.Component {
    constructor(params) {
        super(params);

        this.onSubmit = this.onSubmit.bind(this);
    }

    generateInput({ type, name, placeholder }) {
        const onChange = (e) => this.setState({ [name]: e.currentTarget.value });
        placeholder = placeholder || capitalize(name);

        return (
            <input key={name} type={type} name={name} onChange={onChange} placeholder={placeholder} />
        );
    }

    onSubmit(e) {
        e.preventDefault();

        this.props.onFormSubmit(this.state);
    }

    render() {
        let inputs = this.props.fields.map(field => {
            return this.generateInput(field)
        });
        
        return (
            <form onSubmit={this.onSubmit}>
                {inputs}
                <button type="submit">Submit</button>
                { this.props.error ? <span>{this.props.error}</span> : null }
            </form>
        );
    }
}