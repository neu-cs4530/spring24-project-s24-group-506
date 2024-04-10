import { render, screen } from '@testing-library/react';
import { nanoid } from 'nanoid';
import React from 'react';
import { TokenLeaderboard } from './TokenLeaderboard';
import PlayerController from '../../../classes/PlayerController';
import * as TownControllerHooks from '../../../classes/TownController';

describe('[T4] TokenLeaderboard', () => {
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

  const players: PlayerController[] = [
    new PlayerController(
      nanoid(),
      'Player 1',
      { x: 0, y: 0, rotation: 'front', moving: false },
      100,
    ),
    new PlayerController(
      nanoid(),
      'Player 2',
      { x: 0, y: 0, rotation: 'front', moving: false },
      50,
    ),
    new PlayerController(
      nanoid(),
      'Player 3',
      { x: 0, y: 0, rotation: 'front', moving: false },
      20,
    ),
  ];
  jest.spyOn(TownControllerHooks, 'usePlayers').mockReturnValue(players);

  beforeEach(() => {
    render(<TokenLeaderboard />);
  });
  it('should render a table with the correct headers and players', () => {
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Player Name')).toBeInTheDocument();
    expect(screen.getByText('Tokens')).toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
