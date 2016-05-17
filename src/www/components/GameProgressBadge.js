import React from 'react';
import Check from 'material-ui/svg-icons/navigation/check';
import Clear from 'material-ui/svg-icons/content/clear';

let GameProgressBadge = ({index, isAnswered, isCorrect, isCurrent}) => {
    let style = {};
    
    if (isCurrent) {
        style.textDecoration = 'underline';
    }
    else if (isAnswered) {
        return isCorrect ? <Check /> : <Clear/>;
    }

    return (
        <span style={style}>{index}</span>
    );
};

export default GameProgressBadge;