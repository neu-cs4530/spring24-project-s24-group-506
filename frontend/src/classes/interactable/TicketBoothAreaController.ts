import {
  BoothItem,
  BoothItemName,
  PlayerID,
  TicketBoothArea as TicketBoothAreaModel,
} from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  TICKET_BOOTH_AREA_TYPE,
} from './InteractableAreaController';
import _ from 'lodash';
import TownController from '../TownController';

/**
 * The events that a TicketBoothAreaController can emit
 */
export type TicketBoothAreaEvents = BaseInteractableEventMap & {
  /**
   * A videoChange event indicates that the video selected for this viewing area has changed.
   * Listeners are passed the new video, which is either a string (the URL to a video), or
   * the value `undefined` to indicate that there is no video set.
   */
  itemPurchased: (items: BoothItem[] | undefined) => void;
  itemEquipped: (itemName: BoothItemName | undefined) => void;
  itemAddedToInventory: (itemsOwned: BoothItemName[]) => void;
};

/**
 * A TicketBoothAreaController manages the state for a TicketBoothArea in the frontend app, serving as a bridge between the video
 * that is playing in the user's browser and the backend TownService, ensuring that all players watching the same video
 * are synchronized in their playback.
 *
 * The TicketBoothAreaController implements callbacks that handle events from the video player in this browser window, and
 * emits updates when the state is updated, @see TicketBoothAreaEvents
 */
export default class TicketBoothAreaController extends InteractableAreaController<
  TicketBoothAreaEvents,
  TicketBoothAreaModel
> {
  private _model: TicketBoothAreaModel;

  private _townController: TownController;

  private _itemEquipped: BoothItemName | undefined;

  private _itemsOwned: BoothItemName[];

  /**
   * Constructs a new TicketBoothAreaController, initialized with the state of the
   * provided TicketBoothAreaModel.
   *
   * @param TicketBoothAreaModel The viewing area model that this controller should represent
   */
  constructor(ticketBoothAreaModel: TicketBoothAreaModel, _townController: TownController) {
    super(ticketBoothAreaModel.id);
    this._model = ticketBoothAreaModel;
    this._townController = _townController;
    this._itemEquipped = undefined;
    this._itemsOwned = [];
  }

  public isActive(): boolean {
    return this._model.items !== undefined;
  }

  public get items() {
    return this._model.items;
  }

  public set items(items: BoothItem[] | undefined) {
    this._model.items = items;
  }

  public get itemEquipped(): BoothItemName | undefined {
    return this._itemEquipped;
  }

  public get itemsOwned(): BoothItemName[] {
    return this._itemsOwned;
  }

  private _equipItem(itemName: BoothItemName | undefined) {
    this._itemEquipped = itemName;
    this.emit('itemEquipped', itemName);
  }

  private _addItemToInventory(itemName: BoothItemName) {
    this._itemsOwned = [...this._itemsOwned, itemName];
    this.emit('itemAddedToInventory', this.itemsOwned);
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    return TICKET_BOOTH_AREA_TYPE;
  }

  /**
   * @returns TicketBoothAreaModel that represents the current state of this TicketBoothAreaController
   */
  public toInteractableAreaModel(): TicketBoothAreaModel {
    return this._model;
  }

  /**
   *
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: TicketBoothAreaModel): void {
    if (!_.isEqual(this._model, updatedModel)) {
      this._model = updatedModel;
      this.emit('itemPurchased', this._model.items);
    }
  }

  /**
   * Sends a request to the server to purchase an item from the ticket booth.
   *
   * @param itemName The name of the item to purchase
   */
  public async purchaseItem(itemName: BoothItemName, playerID: PlayerID) {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'TicketBoothPurchase',
      itemName: itemName,
      playerID: playerID,
    });
    this._addItemToInventory(itemName);
    console.log(`Purchased item: ${itemName}`);
  }

  /**
   * Sends a request to the server to equip an item from the ticket booth.
   * @param itemName The name of the item to equip
   * @param playerID The ID of the player equipping the item
   */
  public async equipItem(itemName: BoothItemName | undefined, playerID: PlayerID) {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'TicketBoothEquip',
      itemName: itemName,
      playerID: playerID,
    });
    this._equipItem(itemName);
    console.log(`Equipped item: ${itemName}`);
  }
}
