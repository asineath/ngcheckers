import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core'
import { PieceComponent } from './piece.component'

@Injectable({
  providedIn: 'root'
})
export class PieceService {
  pieceComponentRef: ComponentRef<PieceComponent>

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  appendPieceComponentToBody(){
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PieceComponent);
    const componentRef = componentFactory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.pieceComponentRef = componentRef;
  }

  removeDialogComponentFromBody() {
    this.appRef.detachView(this.pieceComponentRef.hostView);
    this.pieceComponentRef.destroy();
  }
}
