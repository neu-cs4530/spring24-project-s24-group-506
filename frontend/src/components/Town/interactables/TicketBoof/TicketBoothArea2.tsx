import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Button,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TicketBoothAreaController from '../../../../classes/interactable/TicketBoothAreaController';
import { BoothItem } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import TicketBoothBoard from './TicketBoothBoard';
import TicketBoothArea from './TicketBoothArea';

/**
 * The TicketBoothArea component renders the Ticket Booth area.
 * It renders the current state of the area, optionally allowing the player to purchase items.
 */
export function TicketBoothArea2({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const ticketBoothAreaController =
    useInteractableAreaController<TicketBoothAreaController>(interactableID);
  const townController = useTownController();

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
  }, [townController, ticketBoothAreaController]);

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

export default function TicketBoothAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<TicketBoothArea>('TicketBoothArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
    }
  }, [townController, gameArea]);
  if (gameArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TicketBoothArea2 interactableID={gameArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
