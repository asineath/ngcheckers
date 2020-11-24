import { applySourceSpanToStatementIfNeeded } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, QueryList, ViewChildren, ViewChild, ViewContainerRef, ComponentFactory, ComponentRef, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { PieceComponent } from '../piece/piece.component';
import { AppState } from '../_state/app.state';
import * as winActions from '../_state/win.actions';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, AfterViewInit {

  resetting: boolean = false;

  board: string[][] = []; 

  pieces: ComponentRef<PieceComponent>[] = [];

  turn$ = new BehaviorSubject<string>(null);

  possibleJumpers: any[] = [];
  possibleMovers: any[] = [];
  possibleJumpsBySelectedPiece: any[] = [];
  possibleMovesBySelectedPiece: any[] = [];

  possibleJumpersC: any[] = [];

  selectedPiece: any = [];
  selectedPieceC: any = [];

  jumpingAgainH: boolean = false;

  winner: string = null;

  wins$: Observable<number>;

  @ViewChild('piecesContainer', {read: ViewContainerRef}) entry: ViewContainerRef;
  constructor(
    private resolver: ComponentFactoryResolver,
    private store: Store<AppState>
  ) { 
    this.wins$ = this.store.select(state => state.wins);
  }

  ngOnInit(): void {
    
    let wins = localStorage.getItem("wins");
    if (wins) {
      this.store.dispatch(new winActions.setWins(parseInt(wins)));
    }
    // this.wins$.subscribe((data) => {
    //   console.log(data);
    // })

    this.resetBoard();
  }


  createStartingPieces() {
    this.board.forEach((r, ir) => {
      r.forEach((c, ic) => {
        if (c) {
          this.createPiece(ir,ic,c);
        }
      })
    });

    //console.log(this.pieces);
  }

  createPiece(row, column, player) {
    const factory = this.resolver.resolveComponentFactory(PieceComponent);
    const componentRef = this.entry.createComponent(factory);
    componentRef.instance.player = player;
    componentRef.instance.row = row;
    componentRef.instance.column = column;
    componentRef.instance.emitPiece.subscribe(event => {
      this.selectPiece(event);
    })
    this.pieces.push(componentRef);
  }

  resetBoard() {

    if (this.resetting) return;

    this.resetting = true;
    this.winner = null;
    this.pieces.forEach(p => {
      p.destroy();
    });
    this.pieces = [];

    this.board = [
      [null,'C',null,'C',null,'C',null,'C'],
      ['C',null,'C',null,'C',null,'C', null],
      [null,'C',null,'C',null,'C',null,'C'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['H',null,'H',null,'H',null,'H',null],
      [null,'H',null,'H',null,'H',null,'H'],
      ['H',null,'H',null,'H',null,'H',null],
    ];
    // this.board = [
    //   [null,null,null,null,null,'C',null,'C'],
    //   ['C',null,'H',null,'C',null,'C', null],
    //   [null,'C',null,null,null,'C',null,'C'],
    //   [null,null,'H',null,null,null,null,null],
    //   [null,null,null,null,null,null,null,null],
    //   ['H',null,'H',null,'H',null,'H',null],
    //   [null,'H',null,'H',null,'C',null,'H'],
    //   ['H',null,'H',null,null,null,null,null],
    // ];
    setTimeout(() => {
      this.createStartingPieces();
      this.resetting = false;
      this.turn$.next('H');
    }, 0)
    
  }

  ngAfterViewInit() {
    this.turn$.subscribe(data => {
      setTimeout(() => {
        if (data == 'H') {
          this.startTurnH();
        } else if (data == 'C') {
          this.clearTurnDataH();
          this.startTurnC();
        }
      }, 500);
      //todo - switch to debounceTime
    })
  }

  startTurnH() {
    this.clearTurnDataH();
    this.checkForJumpsH();
    this.checkForMovesH();
  }

  clearTurnDataH() {
    this.jumpingAgainH = false;
    this.possibleJumpers = [];
    this.possibleMovers = [];
    this.possibleMovesBySelectedPiece = [];
    this.possibleJumpsBySelectedPiece = [];
    this.selectedPiece = null;
  }

  startTurnC() {

    this.possibleJumpersC = [];
    let possibleMoversC = [];

    this.pieces.forEach(p => {
      if (p.instance.player == 'C') {
        this.checkPieceCanJumpC(p);
      }
    })
  
    this.pieces.forEach(p => {
      if (p.instance.player == 'C') {
        let row = p.instance.row;
        let column = p.instance.column;

        if (
          this.spaceExists(row + 1, column - 1) &&
          !this.pieceAtPosition(row + 1, column - 1)
        ) {
          possibleMoversC.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row + 1,
            toColumn: column -1
          });
        }

        if (
          this.spaceExists(row + 1, column + 1) &&
          !this.pieceAtPosition(row + 1, column + 1)
        ) {
          possibleMoversC.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row + 1,
            toColumn: column + 1
          });
        }

        if (
          p.instance.isKing && 
          this.spaceExists(row - 1, column - 1) &&
          !this.pieceAtPosition(row - 1, column - 1)
        ) {
          possibleMoversC.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row - 1,
            toColumn: column - 1
          });
        }

        if (
          p.instance.isKing && 
          this.spaceExists(row - 1, column + 1) &&
          !this.pieceAtPosition(row - 1, column + 1)
        ) {
          possibleMoversC.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row - 1,
            toColumn: column + 1
          });
        }
      }
    })
  
    //console.log(this.possibleJumpersC);
    //console.log(possibleMoversC);

    if (this.possibleJumpersC.length) {
      let ji = Math.floor(Math.random() * this.possibleJumpersC.length);
      this.selectedPieceC = this.pieceAtPosition(this.possibleJumpersC[ji].fromRow, this.possibleJumpersC[ji].fromColumn);
      //console.log(this.selectedPieceC);
      this.moveSelectedPieceC(this.possibleJumpersC[ji].toRow, this.possibleJumpersC[ji].toColumn);
    } else if (possibleMoversC.length) {
      let mi = Math.floor(Math.random() * possibleMoversC.length);
      this.selectedPieceC = this.pieceAtPosition(possibleMoversC[mi].fromRow, possibleMoversC[mi].fromColumn);
      //console.log(this.selectedPieceC);
      this.moveSelectedPieceC(possibleMoversC[mi].toRow, possibleMoversC[mi].toColumn);
    } else {
      this.winner = 'H';
      this.store.dispatch(new winActions.addWin());
    }
  }

  

  checkForJumpsH() {
    this.pieces.forEach(p => {
      if (p.instance.player == 'H') {
        this.checkPieceCanJumpH(p);
      }
    })
  }

  checkForMovesH() {
    this.pieces.forEach(p => {
      if (p.instance.player == 'H') {
        let row = p.instance.row;
        let column = p.instance.column;

        if (
          this.spaceExists(row - 1, column - 1) &&
          !this.pieceAtPosition(row - 1, column - 1)
        ) {
          this.possibleMovers.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row - 1,
            toColumn: column -1
          });
        }

        if (
          this.spaceExists(row - 1, column + 1) &&
          !this.pieceAtPosition(row - 1, column + 1)
        ) {
          this.possibleMovers.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row - 1,
            toColumn: column + 1
          });
        }

        if (
          p.instance.isKing &&
          this.spaceExists(row + 1, column - 1) &&
          !this.pieceAtPosition(row + 1, column - 1)
        ) {
          this.possibleMovers.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row + 1,
            toColumn: column - 1
          });
        }

        if (
          p.instance.isKing &&
          this.spaceExists(row + 1, column + 1) &&
          !this.pieceAtPosition(row + 1, column + 1)
        ) {
          this.possibleMovers.push({
            fromRow: row, 
            fromColumn: column,
            toRow: row + 1,
            toColumn: column + 1
          });
        }
      }
    })

    //console.log(this.possibleMovers);

    if (this.possibleJumpers.length == 0 && this.possibleMovers.length == 0) {
      this.winner = 'C';
    }
  }

  spaceIsPossibleJumper(row, column) {
    let isPossibleJumper = false;
    this.possibleJumpers.forEach(p => {
      if (p.fromRow == row && p.fromColumn == column) {
        isPossibleJumper = true;
      }
    })
    return isPossibleJumper;
  }

  spaceIsPossibleMover(row, column) {
    if (this.possibleJumpers.length) return false;

    let isPossibleMover = false;
    this.possibleMovers.forEach(p => {
      if (p.fromRow == row && p.fromColumn == column) {
        isPossibleMover = true;
      }
    })
    return isPossibleMover;
  }

  spaceIsPossibleJump(row, column) {
    let isPossibleJump = false;
    this.possibleJumpsBySelectedPiece.forEach(p => {
      if (p.row == row && p.column == column) {
        isPossibleJump = true;
      }
    })
    return isPossibleJump;
  }

  spaceIsPossibleMove(row, column) {
    let isPossibleMove = false;
    this.possibleMovesBySelectedPiece.forEach(p => {
      if (p.row == row && p.column == column) {
        isPossibleMove = true;
      }
    })
    return isPossibleMove;
  }

  pieceAtPosition(row, column) {
    let piece = null;
    this.pieces.forEach(p => {
      if (p.instance.row == row && p.instance.column == column) {
        piece = p;
      }
    })
    return piece;
  }

  selectPiece(event) {
    if (this.jumpingAgainH) {
      return;
    }
    //console.log(event.row, event.column);
    this.selectedPiece = ({row: event.row, column: event.column});
    this.possibleJumpsBySelectedPiece = [];
    this.possibleMovesBySelectedPiece = [];
    if (
      this.spaceIsPossibleJumper(event.row, event.column) || 
      this.spaceIsPossibleMover(event.row, event.column)) {
        this.highlightPossibleMoves(event);
    }
  }

  highlightPossibleMoves(event) {
    this.possibleJumpers.forEach(j => {
      if (j.fromRow == event.row && j.fromColumn == event.column) {
        this.possibleJumpsBySelectedPiece.push({
          row: j.toRow,
          column: j.toColumn
        })
      }
    });

    if (this.possibleJumpsBySelectedPiece.length) return;

    this.possibleMovers.forEach(m => {
      if (m.fromRow == event.row && m.fromColumn == event.column) {
        this.possibleMovesBySelectedPiece.push({
          row: m.toRow,
          column: m.toColumn
        })
      }
    });

    //console.log(this.possibleJumpsBySelectedPiece);
    //console.log(this.possibleMovesBySelectedPiece);
  }

  moveSelectedPiece(toRow, toColumn) {
    let piece = this.pieceAtPosition(this.selectedPiece.row, this.selectedPiece.column);
    let fromRow = piece.instance.row;
    let fromColumn = piece.instance.column;

    piece.instance.row = toRow;
    piece.instance.column = toColumn;
    piece.instance.setPosition();

    let jumped = false;

    if (Math.abs(fromRow - toRow) % 2 == 0) {
      let removedPieceRow = (fromRow + toRow) / 2;
      let removedPieceColumn = (fromColumn + toColumn) / 2;
      let removedPiece = this.pieceAtPosition(removedPieceRow, removedPieceColumn);
      this.pieces = this.pieces.filter(p => p != removedPiece);
      removedPiece.destroy();
      jumped = true;
    }

    this.jumpingAgainH = false;

    this.clearTurnDataH();
    if (jumped) {
      this.checkPieceCanJumpH(piece);
      if (this.possibleJumpers.length) {
        this.selectPiece({row: piece.instance.row, column: piece.instance.column})
        this.jumpingAgainH = true;
      } else {
        this.turn$.next('C');
      }
    } else {
      this.turn$.next('C');
    }
  }

  moveSelectedPieceC(toRow, toColumn) {
    //console.log(this.selectedPieceC);
    let piece = this.pieceAtPosition(this.selectedPieceC.instance.row, this.selectedPieceC.instance.column);
    let fromRow = piece.instance.row;
    let fromColumn = piece.instance.column;

    piece.instance.row = toRow;
    piece.instance.column = toColumn;
    piece.instance.setPosition();

    let jumped = false;

    if (Math.abs(fromRow - toRow) % 2 == 0) {
      let removedPieceRow = (fromRow + toRow) / 2;
      let removedPieceColumn = (fromColumn + toColumn) / 2;
      let removedPiece = this.pieceAtPosition(removedPieceRow, removedPieceColumn);
      this.pieces = this.pieces.filter(p => p != removedPiece);
      removedPiece.destroy();
      jumped = true;
    }

    this.selectedPieceC = piece;
    this.possibleJumpersC = [];

    setTimeout(() => {
      if (jumped) {
        this.checkPieceCanJumpC(piece);
        if (this.possibleJumpersC.length) {
          let ji = Math.floor(Math.random() * this.possibleJumpersC.length);
          
          this.moveSelectedPieceC(this.possibleJumpersC[ji].toRow, this.possibleJumpersC[ji].toColumn);
        } else {
          this.turn$.next('H');
        }
      } else {
        this.turn$.next('H');
      }
  
      this.clearTurnDataH();
      this.turn$.next('H');
    },200)
    
  }

  checkPieceCanJumpC(p) {
    let row = p.instance.row;
    let column = p.instance.column;

    if (
      this.spaceExists(row + 2, column - 2) &&
      this.pieceAtPosition(row + 1, column - 1)?.instance.player == 'H' &&
      !this.pieceAtPosition(row + 2, column - 2)
    ) {
      this.possibleJumpersC.push({
        fromRow: row, 
        fromColumn: column, 
        toRow: row + 2, 
        toColumn: column - 2
      });
    }

    if (
      this.spaceExists(row + 2, column + 2) &&
      this.pieceAtPosition(row + 1, column + 1)?.instance.player == 'H' &&
      !this.pieceAtPosition(row + 2, column + 2)
    ) {
      this.possibleJumpersC.push({
        fromRow: row, 
        fromColumn: column,
        toRow: row + 2,
        toColumn: column + 2
      });
    }

    if (
      p.instance.isKing && 
      this.spaceExists(row - 2, column - 2) &&
      this.pieceAtPosition(row - 1, column - 1)?.instance.player == 'H' &&
      !this.pieceAtPosition(row - 2, column - 2)
    ) {
      this.possibleJumpersC.push({
        fromRow: row, 
        fromColumn: column, 
        toRow: row - 2, 
        toColumn: column - 2
      });
    }

    if (
      p.instance.isKing && 
      this.spaceExists(row - 2, column + 2) &&
      this.pieceAtPosition(row - 1, column + 1)?.instance.player == 'H' &&
      !this.pieceAtPosition(row - 2, column + 2)
    ) {
      this.possibleJumpersC.push({
        fromRow: row, 
        fromColumn: column, 
        toRow: row - 2, 
        toColumn: column + 2
      });
    }
  }

  checkPieceCanJumpH(p) {
    let row = p.instance.row;
    let column = p.instance.column;

    if (
      this.spaceExists(row - 2, column - 2) &&
      this.pieceAtPosition(row - 1, column - 1)?.instance.player == 'C' &&
      !this.pieceAtPosition(row - 2, column - 2)
    ) {
      this.possibleJumpers.push({
        fromRow: row, 
        fromColumn: column, 
        toRow: row - 2, 
        toColumn: column - 2
      });
    }

    if (
      this.spaceExists(row - 2, column + 2) &&
      this.pieceAtPosition(row - 1, column + 1)?.instance.player == 'C' &&
      !this.pieceAtPosition(row - 2, column + 2)
    ) {
      this.possibleJumpers.push({
        fromRow: row, 
        fromColumn: column,
        toRow: row - 2,
        toColumn: column + 2
      });
    }

    if (
      p.instance.isKing && 
      this.spaceExists(row + 2, column - 2) &&
      this.pieceAtPosition(row + 1, column - 1)?.instance.player == 'C' &&
      !this.pieceAtPosition(row + 2, column - 2)
    ) {
      this.possibleJumpers.push({
        fromRow: row, 
        fromColumn: column, 
        toRow: row + 2, 
        toColumn: column - 2
      });
    }

    if (
      p.instance.isKing && 
      this.spaceExists(row + 2, column + 2) &&
      this.pieceAtPosition(row + 1, column + 1)?.instance.player == 'C' &&
      !this.pieceAtPosition(row + 2, column + 2)
    ) {
      this.possibleJumpers.push({
        fromRow: row, 
        fromColumn: column, 
        toRow: row + 2, 
        toColumn: column + 2
      });
    }
  }

  spaceExists(row, column) {
    if (row < 0 || row > 7 || column < 0 || column > 7) return false;
    else return true;
  }

  resetWins() {
    this.store.dispatch(new winActions.resetWins());
  }
  


}
