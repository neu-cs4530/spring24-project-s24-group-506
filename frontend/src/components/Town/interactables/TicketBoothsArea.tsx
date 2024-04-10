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
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicketBoothAreaController corresponding to the provided interactableID to get
 *  the current state of the ticketbooth. (@see useInteractableAreaController)
 *
 * TESTED MANUALLY
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
