import React from 'react';
import capitalize from 'lodash/capitalize';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import FacebookLogin from './FacebookLogin';

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
            margin: '10px 8px',
            display: 'inline-block'
        };

        let cls = `genericForm ${this.props.className || this.props.header.toLowerCase().replace(/\s/g, '')}`;

        let padding = { padding: '20px' };

        return (
            <div className={cls}>
                <Paper zDepth={2}>
                    <AppBar className="header" title={this.props.header} showMenuIconButton={false} />

                    <div style={padding}>
                        <form className={this.props.className} onSubmit={this.onSubmit}>
                            {inputs}
                            <RaisedButton style={buttonStyle} primary={true} type="submit" label={this.props.header} />
                            <FacebookLogin style={buttonStyle}  />
                            { this.props.error ? <div className="error">{this.props.error}</div> : null }
                            { this.props.appendix }
                        </form>
                    </div>
                </Paper>
            </div>
        );
    }
}