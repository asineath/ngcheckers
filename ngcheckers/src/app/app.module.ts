import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { PieceComponent } from './piece/piece.component';
import { StoreModule } from '@ngrx/store';
import { WinReducer } from './_state/win.reducer';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PieceComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    StoreModule.forRoot({wins: WinReducer}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
