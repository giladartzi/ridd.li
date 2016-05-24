import React from 'react';
import Check from 'material-ui/svg-icons/navigation/check';
import Clear from 'material-ui/svg-icons/content/clear';
import Help from 'material-ui/svg-icons/action/help-outline';
import Paper from 'material-ui/Paper';
import ActionHourglassEmpty from 'material-ui/svg-icons/action/hourglass-empty';

let GameProgressBadge = ({index, isAnswered, isCorrect, isCurrent, isTimedOut}) => {
    let style = {
        height: 30,
        width: 30,
        margin: 5,
        textAlign: 'center',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    let content = <Help />;
    
    if (isAnswered) {
        content = isCorrect ? <Check /> : <Clear/>;
    }
    
    if (isTimedOut) {
        content = <ActionHourglassEmpty />;
    }

    return (
        <Paper style={style} zDepth={2} circle={true}>{content}</Paper>
    );
};

export default GameProgressBadge;