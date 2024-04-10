import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import TargetShooterAreaController from '../../../../classes/interactable/TargetShooterAreaController';
import PlayerController from '../../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { randomLocation } from '../../../../TestUtils';
import { GameArea, GameStatus, TargetShooterGameState } from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import TargetShooterAreaWrapper from './TargetShooterArea';
import * as TargetShooterDisplay from './TargetShooterDisplay';
import React from 'react';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('TicTacToe');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

const boardComponentSpy = jest.spyOn(TargetShooterDisplay, 'default');
boardComponentSpy.mockReturnValue(<div data-testid='board' />);

class MockTargetShooterAreaController extends TargetShooterAreaController {
  makeMove = jest.fn();

  joinGame = jest.fn();

  mockIsPlayer = false;

  mockMoveCount = 0;

  mockWinner: PlayerController | undefined = undefined;

  mockWhoseTurn: PlayerController | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockPlayer1: PlayerController | undefined = undefined;

  mockPlayer2: PlayerController | undefined = undefined;

  mockCurrentGame: GameArea<TargetShooterGameState> | undefined = undefined;

  mockGamePiece: 'player1' | 'player2' = 'player1';

  mockIsActive = false;

  public constructor() {
    super(nanoid(), mock<GameArea<TargetShooterGameState>>(), mock<TownController>());
  }

  get player1(): PlayerController | undefined {
    return this.mockPlayer1;
  }

  get player2(): PlayerController | undefined {
    return this.mockPlayer2;
  }

  get winner(): PlayerController | undefined {
    return this.mockWinner;
  }

  get status(): GameStatus {
    return this.mockStatus;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  get gamePiece(): 'player1' | 'player2' {
    return this.mockGamePiece;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  public mockReset() {
    this.makeMove.mockReset();
  }
}
describe('[T2] PongArea', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  let gameAreaController = new MockTargetShooterAreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;

  function renderTargetShooterArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <TargetShooterAreaWrapper interactableID={nanoid()} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }
  beforeEach(() => {
    ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    mockGameArea.name = nanoid();
    mockReset(townController);
    gameAreaController.mockReset();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.makeMove.mockReset();

    gameAreaController.joinGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          joinGameResolve = resolve;
          joinGameReject = reject;
        }),
    );
  });
  describe('[T2.1] Game update listeners', () => {
    it('Registers exactly two listeners when mounted: one for gameUpdated and one for gameEnd', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderTargetShooterArea();
      expect(addListenerSpy).toBeCalledTimes(3);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('gameEnd', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('difficultyUpdated', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderTargetShooterArea();
      expect(addListenerSpy).toBeCalledTimes(3);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <TargetShooterAreaWrapper interactableID={nanoid()} />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderTargetShooterArea();
      expect(addListenerSpy).toBeCalledTimes(3);
      const addedListeners = addListenerSpy.mock.calls;
      const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      const addedGameEndedListener = addedListeners.find(call => call[0] === 'gameEnd');
      expect(addedGameEndedListener).toBeDefined();
      expect(addedGameUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(3);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      const removedGameEndedListener = removedListeners.find(call => call[0] === 'gameEnd');
      expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
      expect(removedGameEndedListener).toEqual(addedGameEndedListener);
    });
    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderTargetShooterArea();
      expect(addListenerSpy).toBeCalledTimes(3);

      gameAreaController = new MockTargetShooterAreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <TargetShooterAreaWrapper interactableID={nanoid()} />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(3);

      expect(addListenerSpy2).toBeCalledTimes(3);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });
  describe('[T2.3] Join game button', () => {
    it('Is not shown when the player is in a not-yet-started game', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockPlayer1 = ourPlayer;
      gameAreaController.mockIsPlayer = true;
      renderTargetShooterArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is not shown if the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockPlayer1 = new PlayerController(
        'player Left',
        'player Left',
        randomLocation(),
      );
      gameAreaController.mockPlayer2 = new PlayerController(
        'player Right',
        'player Right',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderTargetShooterArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is enabled when the player is not in a game and the game is not in progress', () => {
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockPlayer1 = undefined;
      gameAreaController.mockPlayer2 = new PlayerController(
        'player Right',
        'player Right',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderTargetShooterArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    describe('When clicked', () => {
      it('Calls joinGame on the gameAreaController', () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        renderTargetShooterArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
      });
      it('Displays a toast with the error message if there is an error joining the game', async () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        const errorMessage = nanoid();
        renderTargetShooterArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        act(() => {
          joinGameReject(new Error(errorMessage));
        });
        await waitFor(() => {
          expect(mockToast).toBeCalledWith(
            expect.objectContaining({
              description: `Error: ${errorMessage}`,
              status: 'error',
            }),
          );
        });
      });

      it('Is disabled and set to loading when the player is joining a game', async () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        renderTargetShooterArea();
        const button = screen.getByText('Join New Game');
        expect(button).toBeEnabled();
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        expect(button).toBeDisabled();
        expect(within(button).queryByText('Loading...')).toBeInTheDocument(); //Check that the loading text is displayed
        act(() => {
          joinGameResolve();
        });
        await waitFor(() => expect(button).toBeEnabled());
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
      });
    });
    it('Adds the display of the button when a game becomes possible to join', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = new PlayerController(
        'player Left',
        'player Left',
        randomLocation(),
      );
      gameAreaController.mockPlayer2 = new PlayerController(
        'player Right',
        'player Right',
        randomLocation(),
      );
      renderTargetShooterArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    it('Removes the display of the button when a game becomes no longer possible to join', () => {
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = undefined;
      gameAreaController.mockPlayer2 = new PlayerController(
        'player O',
        'player O',
        randomLocation(),
      );
      renderTargetShooterArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockPlayer1 = new PlayerController(
          'player Left',
          'player Left',
          randomLocation(),
        );
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
  });
  describe('[T2.5] Players in the game text', () => {
    it('Displays the username of the player1 player if the player1 player is in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
      renderTargetShooterArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`player1: ${gameAreaController.mockPlayer1?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays the username of the player2 player if the player2 player is in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
      renderTargetShooterArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`player2: ${gameAreaController.mockPlayer2?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays "player1: (No player yet!)" if the player1 player is not in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = undefined;
      renderTargetShooterArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`player1: (No player yet!)`)).toBeInTheDocument();
    });
    it('Displays "player2: (No player yet!)" if the player2 player is not in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer2 = undefined;
      renderTargetShooterArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`player2: (No player yet!)`)).toBeInTheDocument();
    });
    it('Updates the player1 player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      renderTargetShooterArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`player1: (No player yet!)`)).toBeInTheDocument();
      act(() => {
        gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`player1: ${gameAreaController.mockPlayer1?.userName}`),
      ).toBeInTheDocument();
    });
    it('Updates the player2 player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      renderTargetShooterArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`player2: (No player yet!)`)).toBeInTheDocument();
      act(() => {
        gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`player2: ${gameAreaController.mockPlayer2?.userName}`),
      ).toBeInTheDocument();
    });
  });
  describe('[T2.6] Game status text', () => {
    it('Displays the correct text when the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      renderTargetShooterArea();
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is over', () => {
      gameAreaController.mockStatus = 'OVER';
      renderTargetShooterArea();
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    it('Updates the game status text when the game is updated', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderTargetShooterArea();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    describe('When the game ends', () => {
      it('Displays a toast with the winner', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player Right',
          'player Right',
          randomLocation(),
        );
        gameAreaController.mockWinner = ourPlayer;
        renderTargetShooterArea();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You won!`,
          }),
        );
      });
      it('Displays a toast with the loser', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = true;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player Right',
          'player Right',
          randomLocation(),
        );
        gameAreaController.mockWinner = gameAreaController.mockPlayer2;
        renderTargetShooterArea();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: 'You lost :(',
          }),
        );
      });
      it('Displays a toast with a tie', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player Right',
          'player Right',
          randomLocation(),
        );
        gameAreaController.mockWinner = undefined;
        renderTargetShooterArea();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `Game ended in a tie`,
          }),
        );
      });
    });
  });
});
