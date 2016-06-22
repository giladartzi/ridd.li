import { takeEvery } from 'redux-saga';
import { put, fork } from 'redux-saga/effects';
import { WS_INVITATION_ACCEPTED, INVITATION_ACCEPT_SUCCESS } from '../../common/consts';
import { push } from 'react-router-redux';

function* changeRouteToGame() {
    yield put(push('/game'));
}

function* watchInvitationAccepted() {
    yield* takeEvery(WS_INVITATION_ACCEPTED, changeRouteToGame);
}

function* watchInvitationAcceptSuccess() {
    yield* takeEvery(INVITATION_ACCEPT_SUCCESS, changeRouteToGame);
}

export default function* routingSaga() {
    yield [
        fork(watchInvitationAccepted),
        fork(watchInvitationAcceptSuccess)
    ];
}