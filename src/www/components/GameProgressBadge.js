import React from 'react';
import Check from 'material-ui/svg-icons/navigation/check';
import Clear from 'material-ui/svg-icons/content/clear';
import Help from 'material-ui/svg-icons/action/help-outline';
import Paper from 'material-ui/Paper';
import ActionHourglassEmpty from 'material-ui/svg-icons/action/hourglass-empty';

let GameProgressBadge = ({index, isAnswered, isCorrect, isCurrent, isTimedOut, muiTheme}) => {
    let style = {
        height: 20,
        width: 20,
        margin: 5,
        textAlign: 'center',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    let iconStyle = {
        width: 18,
        height: 18
    };

    if (isCurrent) {
        style.width = style.height = 30;
        iconStyle.width = iconStyle.height = 24;
    }

    let content = <Help style={iconStyle} />;
    
    if (isAnswered) {
        content = isCorrect ? <Check style={iconStyle} /> : <Clear style={iconStyle} />;
    }
    
    if (isTimedOut) {
        content = <ActionHourglassEmpty style={iconStyle} />;
    }

    return (
        <Paper style={style} zDepth={2} circle={true}>{content}</Paper>
    );
};

export default GameProgressBadge;