import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit, OnChanges {

  isKing: boolean = false;
  isActive: boolean = true;

  @Input() player: string;
  @Input() location: any;
  @Output() emitPiece = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log(changes);
  }


  selectPiece() {
    let data = {row: this.location.row, column: this.location.column, isKing: this.isKing}
    console.log(data)
    this.emitPiece.emit(data);
  }

}
