import React from 'react';
import capitalize from 'lodash/capitalize';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';

export default class UserPasswordForm extends React.Component {
    constructor(params) {
        super(params);

        this.onSubmit = this.onSubmit.bind(this);
    }

    generateInput({ type, name, placeholder }) {
        const onChange = (e) => this.setState({ [name]: e.currentTarget.value });
        placeholder = placeholder || capitalize(name);

        return (
            <div key={name} className={name}>
                <TextField fullWidth={true} type={type} onChange={onChange} hintText={placeholder} />
            </div>
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

        let buttonStyle = {
            margin: '10px'
        };

        let cls = `genericForm ${this.props.className || this.props.header.toLowerCase().replace(/\s/g, '')}`;

        return (
            <div className={cls}>
                <Paper zDepth={2}>
                    <AppBar className="header" title={this.props.header} iconElementLeft={<div />} />
                    <div style={{padding: '20px'}}>
                        <form className={this.props.className} onSubmit={this.onSubmit}>
                            {inputs}
                            <RaisedButton style={buttonStyle} primary={true} type="submit" label={this.props.header} />
                            { this.props.error ? <div className="error">{this.props.error}</div> : null }
                            { this.props.appendix }
                        </form>
                    </div>
                </Paper>
            </div>
        );
    }
}