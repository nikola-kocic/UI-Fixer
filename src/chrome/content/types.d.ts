declare var CustomizableUI: {
  AREA_NAVBAR: string;
  AREA_MENUBAR: string;
  AREA_PANEL: string;
  getPlacementOfWidget(aWidgetId: string): {area: string, position: number};
  addWidgetToArea(aWidgetId: string, aAreaId: string, aPosition?: number): void;
  removeWidgetFromArea(aWidgetId: string): void;
  addListener(aListener: ICustomizeObserver): void;
}

declare var Components: {
  classes: { [key:string]: any };
  interfaces: {
    nsIPrefService: void;
    nsIPrefBranch2: void;
    nsIWindowMediator: void;
  };
}

interface IObserver {
  observe(aSubject: void, aTopic: string, aData: string): void;
}

interface IPrefBranch {
  QueryInterface(name: any): any;
  getBoolPref(name: string): boolean;
  setBoolPref(name: string, value: boolean): void;
  addObserver(aDomain: string, aObserver: IObserver, aHoldWeak: boolean): void;
  removeObserver(aDomain: string, aObserver: IObserver): void;
}

interface IPrefService {
  getBranch(name: string): any;
}

declare var BrowserOpenTab: () => void;

interface ICustomizeObserver {
  onWidgetBeforeDOMChange?(aNode: HTMLElement, aNextNode: HTMLElement, aContainer: HTMLElement, aIsRemoval: boolean): void;
  onWidgetAdded?(aWidgetId: string, aArea: string, aPosition: number): void;
  onWidgetRemoved?(aWidgetId: string, aArea: string): void;
  onWidgetAfterDOMChange?(aNode: HTMLElement, aNextNode: HTMLElement, aContainer: HTMLElement, aWasRemoval: boolean): void;
  onAreaReset?(aArea: string, aContainer: HTMLElement): void;
  onWidgetReset?(aNode: HTMLElement, aContainer: HTMLElement): void;
  onWidgetMoved?(aWidgetId: string, aArea: string, aOldPosition: number, aNewPosition: number): void;
  onWidgetUndoMove?(aNode: HTMLElement, aContainer: HTMLElement): void;
  onAreaNodeUnregistered?(aArea: string, aNode: HTMLElement, aReason: string): void;
  onAreaNodeRegistered?(aArea: string, aNode: HTMLElement): void;
  onWidgetCreated?(aWidgetId: string): void;
  onWidgetAfterCreation?(aWidgetId: string, aArea: string): void;
  onWidgetDestroyed?(aWidgetId: string): void;
  onWidgetInstanceRemoved?(aWidgetId: string, aDocument: Document): void;
  onWidgetDrag?(aWidgetId: string, aArea: string): void;
  onCustomizeStart?(aWindow: Window): void;
  onCustomizeEnd?(aWindow: Window): void;
  onWidgetOverflow?(aNode: HTMLElement, aContainer: HTMLElement): void;
  onWidgetUnderflow?(aNode: HTMLElement, aContainer: HTMLElement): void;
}
