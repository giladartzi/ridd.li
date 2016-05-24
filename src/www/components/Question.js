import React from 'react';
import { connect } from 'react-redux';
import { List, ListItem} from 'material-ui/List';
import { createApiAction } from '../utils/utils';
import { ANSWER_ACTIONS } from '../../common/consts';
import ActionInfo from 'material-ui/svg-icons/action/info';

let Question = ({ disabled, game, sendAnswer }) => {
    let answers = game.question.answers.map((answer, index) => {
        let cls = 'answer';
        
        if (answer.isCorrect) {
            cls = 'correctAnswer';
        }
        
        return (
            <ListItem className={cls} key={index} primaryText={answer.text} leftIcon={<ActionInfo />}
                      onTouchTap={() => sendAnswer(game.gameId, game.questionIndex, index)} disabled={disabled} />
        );

    });

    return (
        <div>
            <div id="question">{ game.question.text }</div>
            <List>
                {answers}
            </List>
        </div>
    );
};

let mapStateToProps = null;

let mapDispatchToProps = (dispatch) => {
    return {
        sendAnswer: (gameId, questionIndex, answerIndex) => {
            dispatch(createApiAction(ANSWER_ACTIONS, '/answer', { gameId, questionIndex, answerIndex }));
        }
    };
};

Question = connect(mapStateToProps, mapDispatchToProps)(Question);

export default Question;