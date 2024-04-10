import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { TownEmitter } from '../types/CoveyTownSocket';
import TicketBoothArea from './TicketBoothArea';
import Player from '../lib/Player';
import { createPlayerForTesting, getLastEmittedEvent } from '../TestUtils';

describe('TicketBoothArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: TicketBoothArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new TicketBoothArea({ items: [], id, occupants: [] }, testAreaBox, townEmitter);
    newPlayer = createPlayerForTesting();
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        items: [],
        occupants: [newPlayer.id],
        type: 'TicketBoothArea',
      });
    });
    it("Emits the player's location to the ticket booth area", () => {
      expect(newPlayer.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = createPlayerForTesting();
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
        id,
        items: [],
        occupants: [extraPlayer.id],
        type: 'TicketBoothArea',
      });
    });
    it('Emits the player location to the ticket booth area', () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
    });
  });
  test('toModel sets the ID, items, occupants, and type of the ticket booth area and sets no other properties', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      items: [],
      occupants: [newPlayer.id],
      type: 'TicketBoothArea',
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the map object does not have a width or height', () => {
      expect(() =>
        TicketBoothArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new TicketBoothArea using the provided boundingBox and id, with the correct ID and items', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = TicketBoothArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.items).toEqual([
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
      ]);
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
describe('Purchase command', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: TicketBoothArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new TicketBoothArea({ items: [], id, occupants: [] }, testAreaBox, townEmitter);
    newPlayer = createPlayerForTesting();
    testArea.add(newPlayer);
    testArea.updateModel({
      items: [
        {
          name: 'BlueHat',
          cost: 10,
          timesPurchased: 0,
          description: 'This is a blue hat that is cheap',
        },
      ],
      type: 'TicketBoothArea',
      id: nanoid(),
      occupants: [newPlayer.id],
    });
  });
  it('Throws an error if the command is not TicketBoothPurchase', () => {
    expect(() => testArea.handleCommand({ type: 'JoinGame' })).toThrowError('Invalid command');
  });
  it('Throws an error if items list is undefined', () => {
    testArea.updateModel({
      items: undefined,
      type: 'TicketBoothArea',
      id: nanoid(),
      occupants: [newPlayer.id],
    });
    expect(() =>
      testArea.handleCommand({
        type: 'TicketBoothPurchase',
        itemName: 'BlueHat',
        playerID: newPlayer.id,
      }),
    ).toThrowError('No items available for purchase');
  });
  it('Throws an error if the player from the command is not found in the occupants list', () => {
    expect(() =>
      testArea.handleCommand({
        type: 'TicketBoothPurchase',
        itemName: 'BlueHat',
        playerID: 'not a real player id',
      }),
    ).toThrowError('Player not found');
  });
  it('Throws an error if the player does not have enough tokens', () => {
    expect(() =>
      testArea.handleCommand({
        type: 'TicketBoothPurchase',
        itemName: 'BlueHat',
        playerID: newPlayer.id,
      }),
    ).toThrowError('Player does not have enough tokens');
  });
  it('Throws an error if the player already owns the item', () => {
    newPlayer.addTokens(100);
    testArea.handleCommand({
      type: 'TicketBoothPurchase',
      itemName: 'BlueHat',
      playerID: newPlayer.id,
    });
    expect(() =>
      testArea.handleCommand({
        type: 'TicketBoothPurchase',
        itemName: 'BlueHat',
        playerID: newPlayer.id,
      }),
    ).toThrowError('Player already owns this item');
  });
  it('Purchases the item and emits the updated player tokens and items as well as update the list of Booth Items', () => {
    newPlayer.addTokens(10);
    testArea.handleCommand({
      type: 'TicketBoothPurchase',
      itemName: 'BlueHat',
      playerID: newPlayer.id,
    });
    expect(testArea.items).toEqual([
      {
        name: 'BlueHat',
        cost: 10,
        timesPurchased: 1,
        description: 'This is a blue hat that is cheap',
      },
    ]);
    expect(newPlayer.tokens).toStrictEqual(0);
    expect(newPlayer.itemsOwned).toEqual(['BlueHat']);
    expect(townEmitter.emit).toHaveBeenCalledWith('playerTokensChanged', newPlayer.toPlayerModel());
    expect(townEmitter.emit).toHaveBeenCalledWith('playerItemsChanged', newPlayer.toPlayerModel());
    const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
    expect(lastEmittedUpdate).toEqual({
      id,
      items: [
        {
          name: 'BlueHat',
          cost: 10,
          timesPurchased: 1,
          description: 'This is a blue hat that is cheap',
        },
      ],
      occupants: [newPlayer.id],
      type: 'TicketBoothArea',
    });
  });
});
