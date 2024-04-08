import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { InteractableID } from '../../../types/CoveyTownSocket';
import { TicketBoothStore } from './TicketBooth/TicketBoothStore';
import { Inventory } from './Inventory';
import { TokenLeaderboard } from './TokenLeaderboard';

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
  return (
    <>
      <Tabs isFitted variant='enclosed'>
        <TabList mb='1em'>
          <Tab>Store</Tab>
          <Tab>Inventory</Tab>
          <Tab>Token Leaderboard</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TicketBoothStore interactableID={interactableID} />
          </TabPanel>
          <TabPanel>
            <Inventory interactableID={interactableID} />
          </TabPanel>
          <TabPanel>
            <TokenLeaderboard />
          </TabPanel>
        </TabPanels>
      </Tabs>
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
