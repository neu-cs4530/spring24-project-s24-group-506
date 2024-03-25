import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { TownEmitter, BoothItem } from '../types/CoveyTownSocket';
import TicketBoothArea from './TicketBoothArea';
import { getLastEmittedEvent } from '../TestUtils';

describe('TicketBoothArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: TicketBoothArea;
  const townEmitter = mock<TownEmitter>();
  const itemPrices: [BoothItem, number][] = [];
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new TicketBoothArea({ itemPrices, id, occupants: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupants: [newPlayer.id],
        itemPrices,
        type: 'TicketBoothArea',
      });
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupants: [extraPlayer.id],
        itemPrices,
        type: 'TicketBoothArea',
      });
    });
    it('toModel sets the ID, occupants, and itemPrices', () => {
      const model = testArea.toModel();
      expect(model.id).toEqual(id);
      expect(model.occupants).toEqual([newPlayer.id]);
      expect(model.itemPrices).toEqual(itemPrices);
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width of height are missing', () => {
      expect(() =>
        TicketBoothArea.fromMapObject(
          {
            x: 100,
            y: 100,
            name: nanoid(),
            id: 0,
            visible: false,
          },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new TicketBoothArea using the provided boundingBox and id, with an empty occupants list', () => {
      const newArea = TicketBoothArea.fromMapObject(
        {
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          name: nanoid(),
          id: 0,
          visible: false,
        },
        townEmitter,
      );
      expect(newArea.id).toBeDefined();
      expect(newArea.occupantsByID).toEqual([]);
    });
  });
});
