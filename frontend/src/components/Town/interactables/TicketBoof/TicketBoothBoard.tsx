import TicketBoothAreaController, {
  TicketBoothItemType,
} from '../../../../classes/interactable/TicketBoothAreaController';
import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { BoothItem } from '../../../../types/CoveyTownSocket';

export type TicketBoothProps = {
  ticketBoothAreaController: TicketBoothAreaController;
};

const StyledTicketBoothBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '350px',
    height: '350px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

const StyledTicketBoothItem = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '14%',
    border: '1px solid black',
    height: '14%',
    fontSize: '20px',
  },
});

/**
 * A component that renders the TicketBooth board
 *
 * Renders the TicketBooth board as a "StyledTicketBoothBoard", which consists of "StyledTicketBoothItem"s
 * (one for each item in the booth, starting from the top left and going left to right, top to bottom).
 *
 * Each StyledTicketBoothItem has an aria-label property that describes the item's name and price.
 *
 * The background color of each StyledTicketBoothItem is determined by the value of the item in the booth.
 *
 * The board is re-rendered whenever the board changes, and each item is re-rendered whenever the value
 * of that item changes.
 *
 * If the current player is in the game, then each StyledTicketBoothItem is clickable, and clicking
 * on it will purchase that item. If there is an error purchasing the item, then a toast will be
 * displayed with the error message as the description of the toast.
 *
 * @param ticketBoothAreaController the controller for the TicketBooth game
 */
export default function TicketBoothBoard({
  ticketBoothAreaController,
}: TicketBoothProps): JSX.Element {
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
  return (
    <StyledTicketBoothBoard>
      {items.map(([itemName, price, quantity]) => (
        <StyledTicketBoothItem
          key={itemName}
          aria-label={`${itemName} $${price}`}
          bg={quantity > 0 ? 'green.200' : quantity === 0 ? 'gray.200' : 'red.200'}
          onClick={() => {
            try {
              ticketBoothAreaController.purchaseItem(itemName);
            } catch (e) {
              toast({
                title: 'Error',
                description: e,
                status: 'error',
              });
            }
          }}>
          {itemName}
        </StyledTicketBoothItem>
      ))}
    </StyledTicketBoothBoard>
  );
}
