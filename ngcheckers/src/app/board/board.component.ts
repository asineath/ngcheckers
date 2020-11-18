import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PieceComponent } from '../piece/piece.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  board: any[] = []; 

  selectedPiece: any = null;
  possibleMoves: string[] = [];

  possibleJumps: any[] = [];

  @ViewChildren(PieceComponent) pieceChildren!: QueryList<PieceComponent>;
  constructor() { }

  ngOnInit(): void {
    this.resetBoard();
  }

  resetBoard() {
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
  }

  checkForJumpsH() {
    console.log('checking for jumps');
    this.possibleJumps = [];

    this.board.forEach((row, ir) => {

      row.forEach((space, ic) => {
        if (space == 'H') {

          let piece = this.getPieceByPosition(ir,ic);

          if (!piece || !piece.isActive) {
            return false;
          }

          if (
            this.spaceExists(ir-2,ic-2) && 
            this.board[ir-1][ic-1] == 'C' &&
            !this.board[ir-2][ic-2]
            ) {
              this.possibleJumps.push({
                piece: piece,
                row: ir,
                column: ic
              })
            }

            if (
              this.spaceExists(ir-2,ic+2) && 
              this.board[ir-1][ic+1] == 'C' &&
              !this.board[ir-2][ic+2]
              ) {
                this.possibleJumps.push({
                  piece: piece,
                  row: ir,
                  column: ic
                })
              }
        }
      });
    });

    console.log(this.possibleJumps);
  }

  isPossibleJumper(row, column) {
    let possibleJump = false;

    this.possibleJumps.forEach(j => {
      if (j.piece.location.row == row && j.piece.location.column == column && j.piece.isActive) {
        console.log('possible jump');
        console.log(j);
        possibleJump = true;
      }
    });

    return possibleJump;
  }

  isPossibleMove(row, column) {
    return this.possibleMoves.indexOf(row+','+column) > -1;
  }

  setSelectedPiece(event) {
    this.selectedPiece = event;
    this.possibleMoves = [];
    this.setPossibleMovesH();
  }

  setPossibleMovesH() {
    
    let sRow = this.selectedPiece.row;
    let sColumn = this.selectedPiece.column;

    let canJump = false;

    if (
      this.spaceExists(sRow-2,sColumn-2) && 
      this.board[sRow-1][sColumn-1] == 'C' &&
      !this.board[sRow-2][sColumn-2]
    ) {
      this.possibleMoves.push((sRow-2) +','+(sColumn-2));
      canJump = true;
    }

    if (
      this.spaceExists(sRow-2,sColumn+2) && 
      this.board[sRow-1][sColumn+1] == 'C' &&
      !this.board[sRow-2][sColumn+2]
    ) {
      this.possibleMoves.push((sRow-2) +','+(sColumn+2));
      canJump = true;
    }

    if (!canJump) {
      if (this.spaceExists(sRow-1,sColumn-1) && !this.board[sRow-1][sColumn-1]) {
        this.possibleMoves.push((sRow-1) +','+(sColumn-1));
      }
      if (this.spaceExists(sRow-1,sColumn+1) && !this.board[sRow-1][sColumn+1]) {
        this.possibleMoves.push((sRow-1)+','+(sColumn+1));
      }
    }

  }

  spaceExists(row, column) {
    if (row < 0 || row > 7) return false;
    if (column < 0 || column > 7) return false;
    return true;
  }

  moveSelectedPiece(position){
    let oldRow = this.selectedPiece.row;
    let oldColumn = this.selectedPiece.column;


    this.board[oldRow][oldColumn] = null;
    this.board[position.row][position.column] = 'H';

    if (
      Math.abs(oldRow - position.row) == 2 && 
      Math.abs(oldColumn - position.column) == 2
    ) {
      this.board[(oldRow + position.row) / 2][(oldColumn + position.column) / 2] = null;
      let removedPiece = this.getPieceByPosition((oldRow + position.row) / 2, (oldColumn + position.column) / 2);
      removedPiece.isActive = false;
    }

    let piece = this.getPieceByPosition(oldRow, oldColumn);
    piece.location = {row: position.row, column: position.column};

    this.possibleMoves = [];

    this.computerTurnCalc();
  }

  getPieceByPosition(row,column) {
    let piece = null;
    this.pieceChildren.forEach(p => {
      if (p.location.row == row && p.location.column == column && p.isActive) {
        piece = p;
      }
    })
    return piece;
  }


  computerTurnCalc() {
    let moves = [];
    let jumps = [];

    console.log(this.pieceChildren);

    this.board.forEach((row, ir) => {
      row.forEach((space, ic) => {
        if (space == 'C') {

          let piece = this.getPieceByPosition(ir,ic);

          if (!piece || !piece.isActive) {
            return;
          }

          if (
            this.spaceExists(ir+2,ic-2) && 
            this.board[ir+1][ic-1] == 'H' &&
            !this.board[ir+2][ic-2]
            ) {
              jumps.push({
                piece: piece,
                row: ir+2,
                column: ic-2
              })
            }

          if (
            this.spaceExists(ir+2,ic+2) && 
            this.board[ir+1][ic+1] == 'H' &&
            !this.board[ir+2][ic+2]
            ) {
              jumps.push({
                piece: piece,
                row: ir+2,
                column: ic+2
              })
            }

          if (this.spaceExists(ir+1,ic-1) && !this.board[ir+1][ic-1]) {
            moves.push({
              piece: piece,
              row: ir+1,
              column: ic-1
            })
          }

          if (this.spaceExists(ir+1,ic+1) && !this.board[ir+1][ic+1]) {
            moves.push({
              piece: piece,
              row: ir+1,
              column: ic+1
            })
          }
        }
      })
    })


    if (jumps.length) {
      let ji = Math.floor(Math.random() * jumps.length);
      let j = jumps[ji];

      this.makeJumpC(j)

    } else {
      //regular move;
      let mi = Math.floor(Math.random() * moves.length);
      let m = moves[mi];

      this.board[m.piece.location.row][m.piece.location.column] = null;
      this.board[m.row][m.column] = 'C';
      m.piece.location = {row: m.row, column: m.column};
    }

    this.checkForJumpsH();
  }

  makeJumpC(j) {
    this.board[j.piece.location.row][j.piece.location.column] = null;
    this.board[j.row][j.column] = 'C';
    
    this.board[(j.piece.location.row + j.row) / 2][(j.piece.location.column + j.column) / 2] = null;

    let removedPiece = this.getPieceByPosition((j.piece.location.row + j.row) / 2, (j.piece.location.column + j.column) / 2);
    removedPiece.isActive = false;

    j.piece.location = {row: j.row, column: j.column};
  }

  logBoard() {
    console.log(this.board);
  }


}
