import { Component, EventEmitter, Host, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit, OnChanges {

  isKing: boolean = false;

  @HostBinding('style.top') top = '0%';
  @HostBinding('style.left') left = '0%';

  @Input() player: string;
  @Input() row: number;
  @Input() column: number;
  @Output() emitPiece = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    this.setPosition();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setPosition();
  }

  setPosition() {
    this.top = this.row * 12.5 + "%";
    this.left = this.column * 12.5 + "%";

    if (this.player == 'H' && this.row == 0) {
      this.isKing = true;
    }

    if (this.player == 'C' && this.row == 7) {
      this.isKing = true;
    }

  }

  selectPiece() {
    this.emitPiece.emit({row: this.row, column: this.column})
  }




}
