import { useEffect, useState } from 'react';
import { ConversationArea as ConversationAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, {
  BaseInteractableEventMap,
  TICKET_BOOTH_AREA_TYPE,
} from './InteractableAreaController';
