import { BoothItem } from '../types/CoveyTownSocket';

export default class TicketBooth {
  private _itemsOnSale: [BoothItem, number, number][];

  public constructor(itemsOnSale: [BoothItem, number, number][]) {
    this._itemsOnSale = itemsOnSale;
  }
}
