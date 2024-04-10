import TicketBoothAreaController, { TicketBoothAreaEvents } from './TicketBoothAreaController';
import { mock, mockClear } from 'jest-mock-extended';
import { TicketBoothArea as TicketBoothAreaModel } from '../../types/CoveyTownSocket';
import TownController from '../TownController';

describe('TicketBoothAreaController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: TicketBoothAreaController;
  let testAreaModel: TicketBoothAreaModel;
  const townController = mock<TownController>();
  const mockListeners = mock<TicketBoothAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: 'testID',
      items: [],
      occupants: ['10'],
      type: 'TicketBoothArea',
    };
    testArea = new TicketBoothAreaController(testAreaModel, townController);
    mockClear(townController);
    mockClear(mockListeners.itemPurchased);
    mockClear(mockListeners.itemEquipped);
    mockClear(mockListeners.itemAddedToInventory);
    testArea.addListener('itemPurchased', mockListeners.itemPurchased);
    testArea.addListener('itemEquipped', mockListeners.itemEquipped);
    testArea.addListener('itemAddedToInventory', mockListeners.itemAddedToInventory);
  });
  describe('TicketBoothAreaController Tests', () => {
    it('should return true if the area is active and false if not', () => {
      expect(testArea.isActive()).toBe(true);
      const testAreaModel2: TicketBoothAreaModel = {
        id: 'testID',
        items: undefined,
        occupants: [],
        type: 'TicketBoothArea',
      };
      const testArea2 = new TicketBoothAreaController(testAreaModel2, townController);
      expect(testArea2.isActive()).toBe(false);
    });
    it('should return the items of the area', () => {
      expect(testArea.items).toEqual([]);
      testArea.items = [
        {
          name: 'BlueHat',
          cost: 10,
          timesPurchased: 0,
          description: 'This is a blue hat that is cheap',
        },
      ];
      expect(testArea.items).toEqual([
        {
          name: 'BlueHat',
          cost: 10,
          timesPurchased: 0,
          description: 'This is a blue hat that is cheap',
        },
      ]);
    });
    it('should return the friendly name of the area', () => {
      expect(testArea.friendlyName).toBe('testID');
    });
    it('should return the type of the area', () => {
      expect(testArea.type).toBe('Ticket Booth Area');
    });
    it('Carries through all of the properties of the model of the area', () => {
      const model = testArea.toInteractableAreaModel();
      expect(model).toEqual(testAreaModel);
    });
    it('Returns the itemEquipped', async () => {
      expect(testArea.itemEquipped).toBeUndefined();
      await testArea.equipItem('BlueHat', '10');
      expect(testArea.itemEquipped).toBe('BlueHat');
    });
    it('Returns the itemsOwned', async () => {
      expect(testArea.itemsOwned).toEqual([]);
      await testArea.purchaseItem('BlueHat', '10');
      expect(testArea.itemsOwned).toEqual(['BlueHat']);
    });
  });
  describe('Item Equipped', () => {
    it('sends an equip item command to the server and updates the itemEquipped', async () => {
      expect(testArea.itemEquipped).toBeUndefined();
      townController.sendInteractableCommand.mockImplementationOnce(async () => {
        return 'BlueHat';
      });
      await testArea.equipItem('BlueHat', '10');
      expect(mockListeners.itemEquipped).toBeCalledWith('BlueHat');
      expect(townController.sendInteractableCommand).toBeCalledWith('testID', {
        type: 'TicketBoothEquip',
        itemName: 'BlueHat',
        playerID: '10',
      });
      expect(testArea.itemEquipped).toBe('BlueHat');
    });
  });
  describe('Item Purchased', () => {
    it('sends an add item to inventory command to the server and updates the itemsOwned', async () => {
      expect(testArea.itemsOwned).toEqual([]);
      townController.sendInteractableCommand.mockImplementationOnce(async () => {
        return 'BlueHat';
      });
      await testArea.purchaseItem('BlueHat', '10');
      expect(mockListeners.itemAddedToInventory).toBeCalledWith(['BlueHat']);
      expect(townController.sendInteractableCommand).toBeCalledWith('testID', {
        type: 'TicketBoothPurchase',
        itemName: 'BlueHat',
        playerID: '10',
      });
      expect(testArea.itemsOwned).toEqual(['BlueHat']);
    });
  });
  describe('Update Model', () => {
    it('should update the model and emit an itemPurchased event if the model changes', () => {
      const newModel: TicketBoothAreaModel = {
        id: 'testID',
        items: [
          {
            name: 'BlueHat',
            cost: 10,
            timesPurchased: 1,
            description: 'This is a blue hat that is cheap',
          },
        ],
        occupants: ['10'],
        type: 'TicketBoothArea',
      };
      testArea.updateFrom(newModel, testArea.occupants);
      expect(mockListeners.itemPurchased).toBeCalledWith(newModel.items);
      expect(testArea.items).toEqual(newModel.items);
    });
  });
});
