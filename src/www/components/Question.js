import React from 'react';
import { connect } from 'react-redux';
import { List, ListItem} from 'material-ui/List';
import { createApiAction } from '../utils/utils';
import { ANSWER_ACTIONS } from '../../common/consts';
import ActionInfo from 'material-ui/svg-icons/action/info';
import CircularProgress from 'material-ui/CircularProgress';
import last from 'lodash/last';

class Question extends React.Component {
    constructor() {
        super();
        this.state = { showAnswers: false };
    }

    newQuestionProcess() {
        this.setState({ showAnswers: false });

        setTimeout(() => {
            this.setState({ showAnswers: true });
        }, 2000);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.game.question.text !== this.props.game.question.text) {
            this.newQuestionProcess();
        }
    }

    componentDidMount() {
        this.newQuestionProcess();
    }

    render() {
        let { game, sendAnswer } = this.props;

        let answers = game.question.answers.map((answer, index) => {
            let cls = 'answer';

            if (answer.isCorrect) {
                cls = 'correctAnswer';
            }

            return (
                <ListItem className={cls} key={index} primaryText={answer.text} leftIcon={<ActionInfo />}
                          onTouchTap={() => sendAnswer(game.gameId, game.questionIndex, index)} />
            );

        });

        let style = {
            margin: '0 auto',
            display: 'block'
        };

        return (
            <div>
                <h1 id="question">{ game.question.text }</h1>
                {
                    this.state.showAnswers ?
                        <List id="answers">
                            {answers}
                            { this.props.isAnswered ? <div id="waitingForOpponent">Question answered, waiting for opponent</div> : null}
                        </List> :
                        <CircularProgress style={style} />
                }

            </div>
        );
    }
}

let mapStateToProps = null;

let mapDispatchToProps = (dispatch, ownProps) => {
    return {
        sendAnswer: (gameId, questionIndex, answerIndex) => {
            if (!ownProps.disabled) {
                dispatch(createApiAction(ANSWER_ACTIONS, '/answer', { gameId, questionIndex, answerIndex }));
            }
        }
    };
};

Question = connect(mapStateToProps, mapDispatchToProps)(Question);

export default Question;