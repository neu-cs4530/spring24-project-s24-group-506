import Player from '../lib/Player';
import {
  BoundingBox,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  TicketBoothArea as TicketBoothAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import TicketBooth from './TicketBooth';
import InteractableArea from './InteractableArea';

export default class TicketBoothArea extends InteractableArea {
  protected _ticketBooth: TicketBooth | undefined;

  /** The TicketBooth area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new TicketBoothArea
   * @returns
   */
  public constructor(
    { items, id }: Omit<TicketBoothAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._ticketBooth?.changeItemsOnSale(items);
  }

  public toModel(): TicketBoothAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      items: this._ticketBooth ? this._ticketBooth._itemsOnSale : [],
      type: 'TicketBoothArea',
    };
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
