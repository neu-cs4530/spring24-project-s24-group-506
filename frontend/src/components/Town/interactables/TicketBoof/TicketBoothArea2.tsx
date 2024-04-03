import { Button, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TicketBoothAreaController from '../../../../classes/interactable/TicketBoothAreaController';
import { BoothItem } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import TicketBoothBoard from './TicketBoothBoard';

/**
 * The TicketBoothArea component renders the Ticket Booth area.
 * It renders the current state of the area, optionally allowing the player to purchase items.
 */
export default function TicketBoothArea2({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const ticketBoothAreaController =
    useInteractableAreaController<TicketBoothAreaController>(interactableID);
  //const townController = useTownController();

  const [items, setItems] = useState<[BoothItem, number, number][]>(
    ticketBoothAreaController.itemPrices,
  );
  const handleItemPurchased = (newItemPrices: [BoothItem, number, number][] | undefined) => {
    setItems(newItemPrices || []);
  };
  const toast = useToast();
  useEffect(() => {
    ticketBoothAreaController.addListener('itemPurchased', handleItemPurchased);
    return () => {
      ticketBoothAreaController.removeListener('itemPurchased', handleItemPurchased);
    };
  }, [ticketBoothAreaController]);

  const [purchasingItem, setPurchasingItem] = useState(false);

  const handlePurchaseItem = async (item: BoothItem) => {
    setPurchasingItem(true);
    try {
      await ticketBoothAreaController.purchaseItem(item);
    } catch (err) {
      toast({
        title: 'Error purchasing item',
        description: err,
        status: 'error',
      });
    } finally {
      setPurchasingItem(false);
    }
  };

  return (
    <div>
      <List aria-label='list of items in the booth'>
        {items.map(([itemName, itemPrice, itemQuantity]) => (
          <ListItem key={itemName}>
            <Button
              aria-label={`Item ${itemName}, Price ${itemPrice}`}
              onClick={() => handlePurchaseItem(itemName)}
              isDisabled={purchasingItem || itemQuantity <= 0}
              isLoading={purchasingItem}>
              {`${itemName} - $${itemPrice}`}
            </Button>
          </ListItem>
        ))}
      </List>
      <TicketBoothBoard ticketBoothAreaController={ticketBoothAreaController} />
    </div>
  );
}
