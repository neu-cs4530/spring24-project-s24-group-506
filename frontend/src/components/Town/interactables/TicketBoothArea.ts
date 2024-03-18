import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class TicketBoothArea extends Interactable {
  // add all the required fields for a ticket booth
  private _ticketBoothText?: Phaser.GameObjects.Text;

  private _ticketBoothInfo?: Phaser.GameObjects.Text;

  private _ticketBooth?: TicketBoothController;

  private _changeListener?: TicketBoothEvents['ticketBoothChange'];

  getType(): KnownInteractableTypes {
    return 'TicketBoothArea';
  }
}
