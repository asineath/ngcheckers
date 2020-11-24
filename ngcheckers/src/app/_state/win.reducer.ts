import * as winActions from './win.actions';
import * as types from './action.types';
import { AppState } from './app.state';

export const initialState: AppState = {
    wins: 0
}

export function WinReducer(state = initialState, action: winActions.Actions):AppState {
    switch(action.type) {
        case types.ADD_WIN: {
            localStorage.setItem("wins", state.wins + 1 + "");
            return {... state, wins: state.wins + 1}
        }
        case types.RESET_WINS: {
            localStorage.setItem("wins", "0");
            return {... state, wins: 0}
        }
        case types.SET_WINS: {
            localStorage.setItem("wins", action.payload + "");
            return {... state, wins: action.payload}
        }
        default: return state;
    }
}