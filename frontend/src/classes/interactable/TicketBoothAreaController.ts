import { useEffect, useState } from 'react';
import { BoothItem, TicketBoothArea as TicketBoothAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  TICKET_BOOTH_AREA_TYPE,
} from './InteractableAreaController';

/**
 * The events that the TicketBoothAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type TicketBoothAreaEvents = BaseInteractableEventMap & {
  itemPurchased: (itemName: BoothItem | undefined) => void;
};

// The special string that will be displayed when a conversation area does not have a topic set
export const NO_ITEM_STRING = '(No Items Available)';

/**
 * A TicketBoothAreaController manages the local behavior of a ticket booth area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of ticket booth areas and the
 * frontend's. The TicketBoothAreaController emits events when the ticket booth area changes.
 */
export default class TicketBoothAreaController extends InteractableAreaController<
  TicketBoothAreaEvents,
  TicketBoothAreaModel
> {
  private _itemPrices?: [BoothItem, number, number][];

  /**
   * Create a new TicketBoothAreaController
   * @param id
   * @param itemPrices
   */
  constructor(id: string, itemPrices?: [BoothItem, number, number][]) {
    super(id);
    this._itemPrices = itemPrices;
  }

  get itemPrices(): [BoothItem, number, number][] | undefined {
    return this._itemPrices;
  }

  toInteractableAreaModel(): TicketBoothAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      itemPrices: this.itemPrices ?? [],
      type: TICKET_BOOTH_AREA_TYPE,
    };
  }

  protected _updateFrom(newModel: TicketBoothAreaModel): void {
    this._itemPrices = newModel.itemPrices;
  }

  /**
   * A ticket booth area is empty if there are no occupants.
   */
  isEmpty(): boolean {
    return this.occupants.length === 0;
  }

  public isActive(): boolean {
    return this.itemPrices !== undefined && this.occupants.length > 0;
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    return TICKET_BOOTH_AREA_TYPE;
  }

  /**
   * Create a new TicketBoothAreaController to match a given TicketBoothAreaModel
   * @param tBoothAreaModel TicketBooth area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromTicketBoothAreaModel(
    tBoothAreaModel: TicketBoothAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): TicketBoothAreaController {
    const ret = new TicketBoothAreaController(tBoothAreaModel.id, tBoothAreaModel.itemPrices);
    ret.occupants = playerFinder(tBoothAreaModel.occupants);
    return ret;
  }

  /**
   * Purchase an item from the ticket booth area.
   * @param itemName The name of the item to purchase
   */
  public purchaseItem(itemName: BoothItem): void {
    if (this.itemPrices) {
      const price = this.itemPrices.find(([item]) => item === itemName)?.[1];
      if (price !== undefined) {
        this.emit('itemPurchased', itemName);
        // add one to the third element of the tuple to indicate that the item has been purchased and update itemPrices
        this._itemPrices = this.itemPrices.map(([item, itemPrice, purchased]) =>
          item === itemName ? [item, price, purchased + 1] : [item, itemPrice, purchased],
        );
      }
    }
  }
}
/**
 * A react hook to retrieve the itemPrices of a TicketBoothAreaController.
 * If there is currently no items, it will return NO_ITEM_STRING.
 *
 * This hook will re-render any components that use it when a ticketbooth item is pruchased.
 */
export function useTicketBoothAreaItemPrices(
  area: TicketBoothAreaController,
): [BoothItem, number, number][] {
  const [itemPrices, setItemPrices] = useState(area.itemPrices);
  useEffect(() => {
    area.addListener('itemPurchased', setItemPrices);
    return () => {
      area.removeListener('itemPurchased', setItemPrices);
    };
  }, [area]);
  return itemPrices ?? ([] || NO_ITEM_STRING);
}
