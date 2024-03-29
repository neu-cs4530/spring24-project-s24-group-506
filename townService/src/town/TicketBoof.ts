import { BoothItem } from '../types/CoveyTownSocket';

export default class TicketBooth {
  private _itemsOnSale: [BoothItem, number, number][];

  public constructor(itemsOnSale: [BoothItem, number, number][]) {
    this._itemsOnSale = itemsOnSale;
  }

  /**
   * Handles a purchase from a player.
   *
   * Updates the player's tokenCount and the third value for itemsOnSale.
   *
   * @param player The player making the purchase
   * @param item The item being purchased
   */
}
