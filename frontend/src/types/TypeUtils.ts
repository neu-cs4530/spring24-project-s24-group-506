import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  GameArea,
  ConnectFourGameState,
  TicketBoothArea,
  PongGameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}
export function isConnectFourArea(
  interactable: Interactable,
): interactable is GameArea<ConnectFourGameState> {
  return interactable.type === 'ConnectFourArea';
}

export function isTicketBoothArea(interactable: Interactable): interactable is TicketBoothArea {
  return interactable.type === 'TicketBoothArea';
}
  
export function isPongArea(interactable: Interactable): interactable is GameArea<PongGameState> {
  return interactable.type === 'PongArea';
}
