import { Badge, Box, Button, Flex, Image, List, ListItem, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TicketBoothAreaController from '../../../classes/interactable/TicketBoothAreaController';
import { useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { BoothItemName, InteractableID, PlayerID } from '../../../types/CoveyTownSocket';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

const itemImages = {
  BlueHat: './assets/hatPictures/BlueHat.png',
  RedHat: './assets/hatPictures/RedHat.png',
  GreenHat: './assets/hatPictures/GreenHat.png',
};

/**
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicketBoothAreaController corresponding to the provided interactableID to get
 * the current state of the players inventory. (@see useInteractableAreaController)
 *
 * TESTED MANUALLY
 */
export function Inventory({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const ticketBoothAreaController = useInteractableAreaController(
    interactableID,
  ) as TicketBoothAreaController;
  const townController = useTownController();
  const [itemEquipped, setItemEquipped] = useState<BoothItemName | undefined>(
    ticketBoothAreaController.itemEquipped,
  );
  const [itemsOwned, setItemsOwned] = useState<BoothItemName[]>(
    ticketBoothAreaController.itemsOwned,
  );
  const toast = useToast();

  const handleEquip = async (item: BoothItemName | undefined, playerID: PlayerID) => {
    try {
      await ticketBoothAreaController.equipItem(item, playerID);
    } catch (e) {
      toast({
        title: 'Error equipping item',
        description: (e as Error).toString(),
        status: 'error',
      });
    }
  };

  const equipPrize = (item: BoothItemName) => {
    return (
      <Button mt={2} onClick={() => handleEquip(item, townController.ourPlayer.id)}>
        Equip Prize
      </Button>
    );
  };
  const unequipPrize = () => {
    return (
      <Button mt={2} onClick={() => handleEquip(undefined, townController.ourPlayer.id)}>
        Unequip Item
      </Button>
    );
  };

  useEffect(() => {
    ticketBoothAreaController.addListener('itemEquipped', setItemEquipped);
    ticketBoothAreaController.addListener('itemAddedToInventory', setItemsOwned);
    return () => {
      ticketBoothAreaController.removeListener('itemEquipped', setItemEquipped);
      ticketBoothAreaController.removeListener('itemAddedToInventory', setItemsOwned);
    };
  }, [townController, ticketBoothAreaController]);

  return (
    <>
      <Flex align='center' justify='center' mt={2}>
        <Text mr={2}>Item you have equipped:</Text>
        <Badge colorScheme='green' p={1}>
          {itemEquipped ? itemEquipped : 'None'}
        </Badge>
      </Flex>
      <List spacing={3} style={{ margin: '20px' }}>
        {itemsOwned.map((item, index) => (
          <ListItem key={index} p={5} shadow='md' borderWidth='1px'>
            <Flex direction='column' align='center' justify='center'>
              <Image boxSize='100px' src={itemImages[item]} alt={item} />
              <Text mt={2} fontSize='xl'>
                {item}
              </Text>
              <Box mt={2}>{itemEquipped !== item ? equipPrize(item) : unequipPrize()}</Box>
            </Flex>
          </ListItem>
        ))}
      </List>
    </>
  );
}
