import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast,
  } from '@chakra-ui/react';
  import React, { useCallback, useEffect, useState } from 'react';
  import { useInteractable } from '../../../classes/TownController';
  import { Omit_ConversationArea_type_ } from '../../../generated/client';
  import useTownController from '../../../hooks/useTownController';

export default function TicketBoothAreaJawn(): JSX.Element {
  return (
    <div>
      TicketBoothArea
    </div>
  );
}