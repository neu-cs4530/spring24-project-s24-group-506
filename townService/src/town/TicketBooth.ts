import { BoothItem } from '../types/CoveyTownSocket';
import Player from '../lib/Player';

export default class TicketBooth {
  public _itemsOnSale: [BoothItem, number, number][];

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
  public handlePurchase(player: Player, item: BoothItem): void {
    const itemIndex = this._itemsOnSale.findIndex(([itemName]) => itemName === item);
    if (itemIndex === -1) {
      throw new Error(`Item ${item} not found in booth`);
    }
    const itemPrice = this._itemsOnSale[itemIndex][1];
    if (player.gameTokens < itemPrice) {
      throw new Error('Player does not have enough tokens to purchase item');
    }
    player._gameTokens -= itemPrice;
    this._itemsOnSale[itemIndex][2] += 1;
  }

  /**
   * changes items on sale to a new items on sale passed into it
   */
  public changeItemsOnSale(newItems: [BoothItem, number, number][]): void {
    this._itemsOnSale = newItems;
  }
}
