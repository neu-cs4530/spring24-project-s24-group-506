import TicketBoothAreaController, {
  TicketBoothAreaEvents,
} from '../../../../classes/interactable/TicketBoothAreaController';
import Interactable, { KnownInteractableTypes } from '../../Interactable';

export default class TicketBoothArea extends Interactable {
  // add all the required fields for a ticket booth
  private _ticketBoothText?: Phaser.GameObjects.Text;

  private _ticketBoothInfo?: Phaser.GameObjects.Text;

  private _ticketBooth?: TicketBoothAreaController;

  private _changeListener?: TicketBoothAreaEvents['itemPurchased'];

  getType(): KnownInteractableTypes {
    return 'ticketBoothArea';
  }

  removedFromScene(): void {
    if (this._changeListener) {
      this._ticketBooth?.removeListener('itemPurchased', this._changeListener);
    }
  }

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._ticketBoothText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      '(No Items)',
      { color: '#000000' },
    );
    this._ticketBooth = this.townController.getTicketBoothAreaController(this);
  }

  overlap(): void {
    if (!this._ticketBoothText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._ticketBoothText.setX(location.x);
    this._ticketBoothText.setY(location.y);
    this._ticketBoothText.setVisible(true);
  }

  overlapExit(): void {
    this._ticketBoothText?.setVisible(false);
  }

  interact(): void {
    this._ticketBoothText?.setVisible(false);
  }
}
