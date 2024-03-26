import TicketBoothAreaController, {
  TicketBoothAreaEvents,
} from '../../../classes/interactable/TicketBoothAreaController';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class TicketBoothArea extends Interactable {
  // add all the required fields for a ticket booth
  private _ticketBoothText?: Phaser.GameObjects.Text;

  private _ticketBoothInfo?: Phaser.GameObjects.Text;

  private _ticketBooth?: TicketBoothAreaController;

  private _changeListener?: TicketBoothAreaEvents['itemPurchased'];

  getType(): KnownInteractableTypes {
    return 'TicketBoothArea';
  }
}
