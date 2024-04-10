import { nanoid } from 'nanoid';
import {
  Player as PlayerModel,
  PlayerLocation,
  TownEmitter,
  BoothItemName,
} from '../types/CoveyTownSocket';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class Player {
  /** The current location of this user in the world map * */
  public location: PlayerLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _userName: string;

  /** The secret token that allows this client to access our Covey.Town service for this town * */
  private readonly _sessionToken: string;

  /** The secret token that allows this client to access our video resources for this town * */
  private _videoToken?: string;

  private _tokens: number;

  private _itemsOwned: BoothItemName[];

  private _itemEquipped: BoothItemName | undefined;

  /** A special town emitter that will emit events to the entire town BUT NOT to this player */
  public readonly townEmitter: TownEmitter;

  constructor(userName: string, townEmitter: TownEmitter) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._id = nanoid();
    this._sessionToken = nanoid();
    this.townEmitter = townEmitter;
    this._tokens = 0;
    this._itemsOwned = [];
    this._itemEquipped = undefined;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get tokens(): number {
    return this._tokens;
  }

  set tokens(value: number) {
    this._tokens = value;
  }

  get itemsOwned(): BoothItemName[] {
    return this._itemsOwned;
  }

  set itemsOwned(value: BoothItemName[]) {
    this._itemsOwned = value;
  }

  get itemEquipped(): BoothItemName | undefined {
    return this._itemEquipped;
  }

  set itemEquipped(value: BoothItemName | undefined) {
    this._itemEquipped = value;
  }

  set videoToken(value: string | undefined) {
    this._videoToken = value;
  }

  get videoToken(): string | undefined {
    return this._videoToken;
  }

  get sessionToken(): string {
    return this._sessionToken;
  }

  toPlayerModel(): PlayerModel {
    return {
      id: this._id,
      location: this.location,
      userName: this._userName,
      tokens: this._tokens,
      itemsOwned: this._itemsOwned,
      itemEquipped: this._itemEquipped,
    };
  }

  addTokens(tokens: number): void {
    this._tokens += tokens;
  }

  removeTokens(tokens: number): void {
    this._tokens -= tokens;
  }

  addItem(item: BoothItemName): void {
    this._itemsOwned.push(item);
  }

  equipItem(item: BoothItemName | undefined): void {
    this._itemEquipped = item;
  }

  hasItem(item: BoothItemName): boolean {
    return this._itemsOwned.includes(item);
  }
}
