import { typeSourceSpan } from '@angular/compiler';
import { Action } from '@ngrx/store';
import * as types from './action.types';

export class addWin implements Action {
    readonly type = types.ADD_WIN;
}

export class resetWins implements Action {
    readonly type = types.RESET_WINS;
}

export class setWins implements Action {
    readonly type = types.SET_WINS;
    constructor(public payload: number) {}
}

export type Actions = addWin | resetWins | setWins;