import Player from '../lib/Player';
import {
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class TicketBoothArea extends InteractableArea {
  public toModel(): Interactable {
    return {
      id: this.id,
      occupants: this.occupantsByID,
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
