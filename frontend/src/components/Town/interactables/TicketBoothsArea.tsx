import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TicketBoothAreaController from '../../../classes/interactable/TicketBoothAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { BoothItem, BoothItemName, InteractableID, PlayerID } from '../../../types/CoveyTownSocket';
import { css, keyframes } from '@emotion/react';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

const itemImages = {
  BlueHat: './assets/hatPictures/BlueHat.png',
  RedHat: './assets/hatPictures/redHat.png',
  GreenHat: './assets/hatPictures/GreenHat.png',
};

const flashing = keyframes`
  0% { color: red; }
  50% { color: green; }
  100% { color: blue; }
`;

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
  const toast = useToast();

  const handlePurchase = async (itemName: BoothItemName, playerID: PlayerID) => {
    // Add your purchase logic here
    try {
      await ticketBoothAreaController.purchaseItem(itemName, playerID);
    } catch (e) {
      toast({
        title: 'Error buying item',
        description: (e as Error).toString(),
        status: 'error',
      });
    }
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
      <Tabs isFitted variant='enclosed'>
        <TabList mb='1em'>
          <Tab>Store</Tab>
          <Tab>Inventory</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
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
            <Flex direction='column' align='center'>
              <Heading
                css={css`
            animation: ${flashing} 3s infinite;
          `}>
                TICKETBOOTH
              </Heading>
              <Flex align='center' justify='center' mb={4}>
                <Text fontSize='2xl' fontWeight='bold' mr={2}>
                  Your Tokens:
                </Text>
                <Badge p={1} fontSize='2xl'>
                  {townController.ourPlayer.tokens}
                </Badge>
              </Flex>
              <Stack spacing={4}>
                {items?.map(boothItem => (
                  <Box key={boothItem.name} p={5} shadow='md' borderWidth='1px'>
                    <Flex align='center'>
                      <Image
                        boxSize='100px'
                        src={itemImages[boothItem.name]}
                        alt={boothItem.name}
                        mr={4}
                      />
                      <Box>
                        <Heading as='h2' size='md' mb={2}>
                          {boothItem.name} - ${boothItem.cost}
                        </Heading>
                        <Text mb={2}>{boothItem.description}</Text>
                        <Text mb={2}>Times Purchased: {boothItem.timesPurchased}</Text>
                        <Button
                          onClick={() => handlePurchase(boothItem.name, townController.ourPlayer.id)}>
                          Purchase
                        </Button>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Flex>
          </TabPanel>
          <TabPanel>
            <p>Items: {JSON.stringify(townController.ourPlayer.itemsOwned)}</p>
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
