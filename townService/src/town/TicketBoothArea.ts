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
import InvalidParametersError from '../lib/InvalidParametersError';

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
    if (command.type === 'HandlePurchase') {
      if (this._ticketBooth) {
        this._ticketBooth.handlePurchase(player, command.item);
        this._emitAreaChanged();
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      throw new InvalidParametersError('TicketBooth not found');
    }
    throw new InvalidParametersError('Invalid command');
  }
}
