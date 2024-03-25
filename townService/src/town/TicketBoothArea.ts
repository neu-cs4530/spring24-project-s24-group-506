import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  TownEmitter,
  TicketBoothArea as TicketBoothAreaModel,
  BoothItem,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import Player from '../lib/Player';
import InvalidParametersError from '../lib/InvalidParametersError';

export default class TicketBoothArea extends InteractableArea {
  /* The number of items in the ticket booth */
  public itemPrices: [BoothItem, number, number][];

  /** The ticket booth area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new TicketBoothArea
   *
   * @param ticketBoothAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this conversation area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { itemPrices, id }: Omit<TicketBoothAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.itemPrices = itemPrices;
  }

  /**
   * Removes a player from this conversation area.
   *
   * Extends the base behavior of InteractableArea to set the topic of this ConversationArea to undefined and
   * emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._emitAreaChanged();
    }
  }

  /**
   * Convert this ConversationArea instance to a simple ConversationAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): TicketBoothAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      itemPrices: this.itemPrices,
      type: 'TicketBoothArea',
    };
  }

  /**
   * Creates a new TicketBoothArea object that will represent a TicketBooth Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this TicketBooth area exists
   * @param broadcastEmitter An emitter that can be used by this TicketBooth area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): TicketBoothArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new TicketBoothArea({ id: name, occupants: [], itemPrices: [] }, rect, broadcastEmitter);
  }

  public handleCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    throw new InvalidParametersError('Unknown command type');
  }
}
