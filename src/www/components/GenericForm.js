import React from 'react';
import capitalize from 'lodash/capitalize';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';

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
                <TextField type={type} onChange={onChange} hintText={placeholder} />
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

        let style = {
            display: 'inline-block',
            padding: '20px',
            margin: '20px auto'
        };

        let buttonStyle = {
            margin: '10px'
        };
        
        return (
            <div style={{textAlign: 'center'}} className={'genericForm' + ' ' + this.props.header.toLowerCase()}>
                <Paper style={style} zDepth={2}>
                    <Subheader className="header">{this.props.header}</Subheader>
                    <form className={this.props.className} onSubmit={this.onSubmit}>
                        {inputs}
                        <RaisedButton style={buttonStyle} type="submit" label={this.props.header} />
                        { this.props.error ? <div className="error">{this.props.error}</div> : null }
                    </form>
                </Paper>
            </div>
        );
    }
}