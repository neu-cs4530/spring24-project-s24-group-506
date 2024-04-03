import { useEffect, useState } from 'react';
import {
  BoothItem,
  InteractableID,
  TicketBoothArea as TicketBoothAreaModel,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  TICKET_BOOTH_AREA_TYPE,
} from './InteractableAreaController';
import TownController from '../TownController';

/**
 * The events that the TicketBoothAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type TicketBoothAreaEvents = BaseInteractableEventMap & {
  itemPurchased: (newItemPrices: [BoothItem, number, number][] | undefined) => void;
};

export type TicketBoothItemType = BoothItem | undefined; // [ItemName, ItemPrice, ItemQuantity]

// The special string that will be displayed when a conversation area does not have a topic set
export const NO_ITEM_STRING = '(No Items Available)';

function createItemsInBooth(): [BoothItem, number, number][] {
  return [
    ['Blue Hat', 10, 0],
    ['Red Hat', 20, 0],
    ['Gold Hat', 30, 0],
  ];
}

/**
 * A TicketBoothAreaController manages the local behavior of a ticket booth area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of ticket booth areas and the
 * frontend's. The TicketBoothAreaController emits events when the ticket booth area changes.
 */
export default class TicketBoothAreaController extends InteractableAreaController<
  TicketBoothAreaEvents,
  TicketBoothAreaModel
> {
  private _items: [BoothItem, number, number][] = createItemsInBooth();

  protected _townController: TownController;

  /**
   * Create a new TicketBoothAreaController
   * @param id
   * @param itemPrices
   */
  constructor(
    id: InteractableID,
    townController: TownController,
    itemPrices?: [BoothItem, number, number][],
  ) {
    super(id);
    this._items = itemPrices ?? createItemsInBooth();
    this._townController = townController;
  }

  get itemPrices(): [BoothItem, number, number][] {
    return this._items;
  }

  toInteractableAreaModel(): TicketBoothAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      items: this.itemPrices,
      type: 'TicketBoothArea',
    };
  }

  protected _updateFrom(newModel: TicketBoothAreaModel): void {
    this._items = newModel.items;
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
    playerFinder: TownController,
  ): void {
    const ret = new TicketBoothAreaController(tBoothAreaModel.id, playerFinder);
    ret.occupants = tBoothAreaModel.occupants.map(playerID => playerFinder.getPlayer(playerID));
    ret._items = tBoothAreaModel.items;
  }

  /**
   * Purchase an item from the ticket booth area.
   * @param itemName The name of the item to purchase
   */
  public purchaseItem(item: BoothItem): void {
    const itemIndex = this._items.findIndex(([itemName]) => itemName === item);
    if (itemIndex === -1) {
      throw new Error(`Item ${item} not found in ticket booth area`);
    }
    if (this._items[itemIndex][2] === 0) {
      throw new Error(`Item ${item} is out of stock`);
    }
    this._items[itemIndex][2] += 1;
    this.emit('itemPurchased', this.itemPrices);
    this._townController.sendInteractableCommand(this.id, {
      type: 'HandlePurchase',
      item,
    });
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
  const [itemPrices, setItemPrices] = useState<[BoothItem, number, number][] | undefined>(
    area.itemPrices,
  );
  useEffect(() => {
    area.addListener('itemPurchased', setItemPrices);
    return () => {
      area.removeListener('itemPurchased', setItemPrices);
    };
  }, [area]);
  return itemPrices ?? [];
}
