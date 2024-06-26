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
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TicketBoothAreaController from '../../../../classes/interactable/TicketBoothAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  BoothItem,
  BoothItemName,
  InteractableID,
  PlayerID,
} from '../../../../types/CoveyTownSocket';
import { css, keyframes } from '@emotion/react';

const itemImages = {
  BlueHat: './assets/hatPictures/BlueHat.png',
  RedHat: './assets/hatPictures/RedHat.png',
  GreenHat: './assets/hatPictures/GreenHat.png',
};

const flashing = keyframes`
    0% { color: red; }
    50% { color: green; }
    100% { color: blue; }
  `;

/**
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicketBoothAreaController corresponding to the provided interactableID to get
 * the current state of the store. (@see useInteractableAreaController)
 *
 * TESTED MANUALLY
 */
export function TicketBoothStore({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
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

  const purchasePrize = (item: BoothItem) => {
    const enoughTokens = townController.ourPlayer.tokens >= item.cost;
    const ownItem = townController.ourPlayer.ownsItem(item.name);

    let text = 'Purchase';
    if (ownItem) text = 'Already own item';
    else if (!enoughTokens) text = 'Not enough tokens';

    return (
      <Button
        isDisabled={!enoughTokens || ownItem}
        onClick={() => handlePurchase(item.name, townController.ourPlayer.id)}>
        {text}
      </Button>
    );
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
                  {purchasePrize(boothItem)}
                </Box>
              </Flex>
            </Box>
          ))}
        </Stack>
      </Flex>
    </>
  );
}
