import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../lib/InvalidParametersError';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableID,
  TownEmitter,
  TicketBoothArea as TicketBoothAreaModel,
  BoothItem,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

function startingItems(): BoothItem[] {
  return [
    {
      name: 'BlueHat',
      cost: 10,
      timesPurchased: 0,
      description: 'This is a blue hat that is cheap',
    },
    {
      name: 'RedHat',
      cost: 20,
      timesPurchased: 0,
      description: 'This is a red hat that is expensive',
    },
    {
      name: 'GreenHat',
      cost: 50,
      timesPurchased: 0,
      description: 'This is a green hat that is very expensive',
    },
  ];
}

export default class TicketBoothArea extends InteractableArea {
  private _items?: BoothItem[];

  public get items() {
    return this._items;
  }

  public get isActive(): boolean {
    return true;
  }

  /**
   * Creates a new TicketBoothArea
   *
   * @param TicketBoothArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, items }: Omit<TicketBoothAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._items = items;
  }

  /**
   * Updates the state of this TicketBoothArea, setting the video, isPlaying and progress properties
   *
   * @param TicketBoothArea updated model
   */
  public updateModel({ items }: TicketBoothAreaModel) {
    this._items = items;
    this._emitAreaChanged();
  }

  /**
   * Convert this TicketBoothArea instance to a simple TicketBoothAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): TicketBoothAreaModel {
    return {
      id: this.id,
      items: this.items,
      occupants: this.occupantsByID,
      type: 'TicketBoothArea',
    };
  }

  /**
   * Creates a new TicketBoothArea object that will represent a Viewing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter,
  ): TicketBoothArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new TicketBoothArea(
      { items: startingItems(), id: name as InteractableID, occupants: [] },
      rect,
      townEmitter,
    );
  }

  /**
   * Handles a purchase command from a player
   * @param command The purchase command
   * @returns An object containing the result of the purchase
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'TicketBoothPurchase') {
      const { items } = this;
      if (!items) {
        throw new InvalidParametersError('No items available for purchase');
      }
      let areaChanged = false;
      const { itemName, playerID } = command;
      items.forEach(item => {
        if (item.name === itemName) {
          areaChanged = true;
          const player = this.occupants.find(p => p.id === playerID);
          if (!player) {
            throw new InvalidParametersError('Player not found');
          }
          if (player.tokens < item.cost) {
            throw new InvalidParametersError('Player does not have enough tokens');
          }
          if (player.hasItem(itemName)) {
            throw new InvalidParametersError('Player already owns this item');
          }
          item.timesPurchased++;
          player.removeTokens(item.cost);
          player.addItem(itemName);
          this._emitPlayerTokensChanged(player);
          this._emitPlayerItemsChanged(player);
        }
      });
      if (areaChanged) {
        this._items = items;
        this._emitAreaChanged();
      }
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'TicketBoothEquip') {
      const { itemName, playerID } = command;
      const player = this.occupants.find(p => p.id === playerID);
      let areaChanged = false;
      if (!player) {
        throw new InvalidParametersError('Player not found');
      }
      if (itemName && !player.hasItem(itemName)) {
        throw new InvalidParametersError('Player does not own this item');
      }
      if (player.itemEquipped === itemName) {
        throw new InvalidParametersError('Player already has this item equipped');
      }
      areaChanged = true;
      player.equipItem(itemName);
      this._emitPlayerEquippedChanged(player);
      if (areaChanged) {
        this._emitAreaChanged();
      }
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
