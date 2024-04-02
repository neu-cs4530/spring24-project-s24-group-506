import InvalidParametersError, {
    GAME_FULL_MESSAGE,
    GAME_NOT_IN_PROGRESS_MESSAGE,
    GAME_NOT_STARTABLE_MESSAGE,
    PLAYER_ALREADY_IN_GAME_MESSAGE,
    PLAYER_NOT_IN_GAME_MESSAGE,
  } from '../../lib/InvalidParametersError';
  import Player from '../../lib/Player';
  import {
    PongGameState,
    GameMove,
    PlayerID,
    PongPlayer,
    PongMove,
    GameStatus,
    PongScoreUpdate,
    XY,
  } from '../../types/CoveyTownSocket';
  import Game from './Game';
  import { update } from 'ramda';

  /**
   * A PongGame is a Game that implements the rules of Connect Four.
   * @see https://en.wikipedia.org/wiki/Connect_Four
   */
  export default class PongGame extends Game<PongGameState, PongMove> {
    private _preferredLeftPlayer?: PlayerID;
  
    private _preferredRightPlayer?: PlayerID;
  
    /**
     * Creates a new PongGame.
     * @param priorGame If provided, the new game will be created such that if either player
     * from the prior game joins, they will be the same color. When the game begins, the default
     * first player is leftPlayer, but if either player from the prior game joins the new game
     * (and clicks "start"), the first player will be the other color.
     */
    public constructor(priorGame?: PongGame) {
      super({
        status: 'WAITING_FOR_PLAYERS',
        leftScore: 0,
        rightScore: 0,
        leftPaddle: { x: 9, y: 320/2 },
        rightPaddle: { x: 400 - 9, y: 320/2 },
        //ballPosition: { x: 800/2, y: 640/2 },
      });
      this._preferredLeftPlayer = priorGame?.state.leftPlayer;
      this._preferredRightPlayer = priorGame?.state.rightPlayer;
    }
  
    /**
     * Indicates that a player is ready to start the game.
     *
     * Updates the game state to indicate that the player is ready to start the game.
     *
     * If both players are ready, the game will start.
     *
     * The first player (leftPlayer or rightPlayer) is determined as follows:
     *   - If neither player was in the last game in this area (or there was no prior game), the first player is leftPlayer.
     *   - If at least one player was in the last game in this area, then the first player will be the other color from last game.
     *   - If a player from the last game *left* the game and then joined this one, they will be treated as a new player (not given the same color by preference).   *
     *
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
     *
     * @param player The player who is ready to start the game
     */
    public startGame(player: Player): void {
      if (this.state.status !== 'WAITING_TO_START') {
        throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
      }
      if (this.state.leftPlayer !== player.id && this.state.rightPlayer !== player.id) {
        throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
      }
      if (this.state.leftPlayer === player.id) {
        this.state.leftPlayerReady = true;
      }
      if (this.state.rightPlayer === player.id) {
        this.state.rightPlayerReady = true;
      }
      this.state = {
        ...this.state,
        status: this.state.leftPlayerReady && this.state.rightPlayerReady ? 'IN_PROGRESS' : 'WAITING_TO_START',
      };
    }
  
    /**
     * Joins a player to the game.
     * - Assigns the player to a color (leftPlayer or rightPlayer). If the player was in the prior game, then attempts
     * to reuse the same color if it is not in use. Otherwise, assigns the player to the first
     * available color (leftPlayer, then rightPlayer).
     * - If both players are now assigned, updates the game status to WAITING_TO_START.
     *
     * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
     * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
     *
     * @param player the player to join the game
     */
    protected _join(player: Player): void {
      if (this.state.rightPlayer === player.id || this.state.leftPlayer === player.id) {
        throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      }
      if (this._preferredLeftPlayer === player.id && !this.state.leftPlayer) {
        this.state = {
          ...this.state,
          status: 'WAITING_FOR_PLAYERS',
          leftPlayer: player.id,
        };
      } else if (this._preferredRightPlayer === player.id && !this.state.rightPlayer) {
        this.state = {
          ...this.state,
          status: 'WAITING_FOR_PLAYERS',
          rightPlayer: player.id,
        };
      } else if (!this.state.leftPlayer) {
        this.state = {
          ...this.state,
          status: 'WAITING_FOR_PLAYERS',
          leftPlayer: player.id,
        };
      } else if (!this.state.rightPlayer) {
        this.state = {
          ...this.state,
          status: 'WAITING_FOR_PLAYERS',
          rightPlayer: player.id,
        };
      } else {
        throw new InvalidParametersError(GAME_FULL_MESSAGE);
      }
      if (this.state.leftPlayer && this.state.rightPlayer) {
        this.state.status = 'WAITING_TO_START';
      }
    }
  
    /**
     * Removes a player from the game.
     * Updates the game's state to reflect the player leaving.
     *
     * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and sets the winner to the other player.
     *
     * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
     *
     * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
     *
     * @param player The player to remove from the game
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     */
    protected _leave(player: Player): void {
      if (this.state.status === 'OVER') {
        return;
      }
      const removePlayer = (playerID: string): PongPlayer => {
        if (this.state.leftPlayer === playerID) {
          this.state = {
            ...this.state,
            leftPlayer: undefined,
            leftPlayerReady: false,
          };
          return 'Left';
        }
        if (this.state.rightPlayer === playerID) {
          this.state = {
            ...this.state,
            rightPlayer: undefined,
            rightPlayerReady: false,
          };
          return 'Right';
        }
        throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
      };
      const side = removePlayer(player.id);
      switch (this.state.status) {
        case 'WAITING_TO_START':
        case 'WAITING_FOR_PLAYERS':
          // no-ops: nothing needs to happen here
          this.state.status = 'WAITING_FOR_PLAYERS';
          break;
        case 'IN_PROGRESS':
          this.state = {
            ...this.state,
            status: 'OVER',
            winner: side === 'Left' ? this.state.rightPlayer : this.state.leftPlayer,
          };
          break;
        default:
          // This behavior can be undefined :)
          throw new Error(`Unexpected game status: ${this.state.status}`);
      }
    }
  
    /**
     * Applies a move to the game.
     * Uses the player's ID to determine which color they are playing as (ignores move.gamePiece).
     *
     * Validates the move, and if it is valid, applies it to the game state.
     *
     * If the move ends the game, updates the game state to reflect the end of the game,
     * setting the status to "OVER" and the winner to the player who won (or "undefined" if it was a tie)
     *
     * @param move The move to attempt to apply
     *
     * @throws InvalidParametersError if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     * @throws INvalidParametersError if the move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
     * @throws InvalidParametersError if the move is invalid per the rules of Connect Four (BOARD_POSITION_NOT_VALID_MESSAGE)
     *
     */
    public applyMove(move: GameMove<PongMove>): void {
      if (this.state.status !== 'IN_PROGRESS') {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      let gamePiece: PongPlayer;
      const newState = { ...this.state };
      if (move.playerID === this.state.leftPlayer) {
        gamePiece = 'Left';
      } else if (move.playerID === this.state.rightPlayer) {
        gamePiece = 'Right';
      } else {
        throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
      }
      if (gamePiece === 'Left') {
        newState.leftPaddle = move.move.location;
      } else {
        newState.rightPaddle = move.move.location;
      }
      this.state = newState;
    }

    public updateScore(score: PongScoreUpdate): void {
        if (this.state.status !== 'IN_PROGRESS') {
            throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
        }
        const newScore = score.score;
        const newState = { ...this.state,  };
        if (score.gamePiece === 'Left') {
            newState.leftScore = newScore;
        } else {
            newState.rightScore = newScore;
        }
        if (newScore >= 5) {
            newState.status = 'OVER';
            newState.winner = score.gamePiece === 'Left' ? this.state.leftPlayer : this.state.rightPlayer;
        }
        this.state = newState;
    }

    // public updateBallPosition(ballPosition: XY): void {
    //     if (this.state.status !== 'IN_PROGRESS') {
    //         throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    //     }
    //     this.state.ballPosition = ballPosition;
    // }
  }
  