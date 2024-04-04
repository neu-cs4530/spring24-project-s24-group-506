import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
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
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TicketBoothAreaController from '../../../classes/interactable/TicketBoothAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import {
  BoothItem,
  BoothItemName,
  GameResult,
  InteractableID,
} from '../../../types/CoveyTownSocket';
import ChatChannel from './ChatChannel';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

/**
 * A generic component that renders a game area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicketBoothAreaController corresponding to the provided interactableID to get the current state of the game. (@see useInteractableAreaController)
 *
 * It renders the following:
 *  - A leaderboard of the game results
 *  - A list of occupants' usernames (in a list with the aria-label 'list of occupants in the game')
 *  - The game area component (either ConnectFourArea or TicTacToeArea). If the game area is NOT a ConnectFourArea or TicTacToeArea, then the message INVALID_GAME_AREA_TYPE_MESSAGE appears within the component
 *  - A chat channel for the game area (@see ChatChannel.tsx), with the property interactableID set to the interactableID of the game area
 *
 */
function TicketBoothsArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const ticketBoothAreaController = useInteractableAreaController(
    interactableID,
  ) as TicketBoothAreaController;
  const townController = useTownController();
  const [occupants, setOccupants] = useState<PlayerController[]>(
    ticketBoothAreaController.occupants,
  );
  const [items, setItems] = useState<BoothItem[] | undefined>(ticketBoothAreaController.items);

  const handlePurchase = async (itemName: BoothItemName) => {
    // Add your purchase logic here
    await ticketBoothAreaController.purchaseItem(itemName);
  };
  useEffect(() => {
    ticketBoothAreaController.addListener('occupantsChange', setOccupants);
    ticketBoothAreaController.addListener('itemPurchased', setItems);
    return () => {
      ticketBoothAreaController.removeListener('occupantsChange', setOccupants);
      ticketBoothAreaController.removeListener('itemPurchased', setItems);
    };
  }, [townController, ticketBoothAreaController]);
  return (
    <>
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Current occupants
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <List aria-label='list of occupants in the game'>
              {occupants.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Flex>
        <h1>Ticket Booth</h1>
        {items?.map(boothItem => (
          <Box key={boothItem.name}>
            <h2>
              {boothItem.name} - ${boothItem.cost} - {boothItem.description} -{' '}
              {boothItem.timesPurchased}
            </h2>
            <Button onClick={() => handlePurchase(boothItem.name)}>Purchase</Button>
          </Box>
        ))}
      </Flex>
    </>
  );
}
/**
 * A wrapper component for the ConnectFourArea and TicTacToeArea components.
 * Determines if the player is currently in a game area on the map, and if so,
 * renders the selected game area component in a modal.
 *
 */
export default function TicketBoothAreaWrapper(): JSX.Element {
  const ticketBoothArea = useInteractable('ticketBoothArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (ticketBoothArea) {
      townController.interactEnd(ticketBoothArea);
    }
  }, [townController, ticketBoothArea]);
  if (ticketBoothArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{ticketBoothArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TicketBoothsArea interactableID={ticketBoothArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
