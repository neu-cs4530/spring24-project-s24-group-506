export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'TicTacToeArea' | 'ConnectFourArea' | 'PongArea' | 'TicketBoothArea' | 'TargetShooterArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
  tokens: number;
  itemsOwned: BoothItemName[];
  itemEquipped?: BoothItemName | undefined;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
  interactableID?: string;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};

export type BoothItemName = 'BlueHat' | 'RedHat' | 'GreenHat';

export interface BoothItem {
  name: BoothItemName;
  cost: number;
  timesPurchased: number;
  description: string;
}

export interface TicketBoothArea extends Interactable {
  items?: BoothItem[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER' | 'WAITING_FOR_PLAYERS';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
} 

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: 'X' | 'O';
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

/**
 * Type for the state of a ConnectFour game.
 * The state of the game is represented as a list of moves, and the playerIDs of the players (red and yellow)
 */
export interface ConnectFourGameState extends WinnableGameState {
  // The moves in this game
  moves: ReadonlyArray<ConnectFourMove>;
  // The playerID of the red player, if any
  red?: PlayerID;
  // The playerID of the yellow player, if any
  yellow?: PlayerID;
  // Whether the red player is ready to start the game
  redReady?: boolean;
  // Whether the yellow player is ready to start the game
  yellowReady?: boolean;
  // The color of the player who will make the first move
  firstPlayer: ConnectFourColor;
}

/**
 * Type for a move in ConnectFour
 * Columns are numbered 0-6, with 0 being the leftmost column
 * Rows are numbered 0-5, with 0 being the top row
 */
export interface ConnectFourMove {
  gamePiece: ConnectFourColor;
  col: ConnectFourColIndex;
  row: ConnectFourRowIndex;
}

/**
 * Row indices in ConnectFour start at the top of the board and go down
 */
export type ConnectFourRowIndex = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * Column indices in ConnectFour start at the left of the board and go right
 */
export type ConnectFourColIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ConnectFourColor = 'Red' | 'Yellow';

export type PongPlayer = 'Left' | 'Right';

export type PongMove = {
  gamePiece: PongPlayer;
  direction: PongPaddleDirection;
}

export type PongPaddleDirection = 'Up' | 'Down' | 'Still';

export type PongScore = 0 | 1 | 2 | 3 | 4 | 5;

export type PongScoreUpdate = {
  gamePiece: PongPlayer;
  score: PongScore;
}

/**
 * Type for the state of a Pong game
 */
export interface PongGameState extends WinnableGameState {
  leftPaddle: XY;
  leftPaddleDirection: PongPaddleDirection;
  rightPaddle: XY;
  rightPaddleDirection: PongPaddleDirection;

  leftScore: PongScore;
  rightScore: PongScore;

  ballPosition: XY;
  ballVelocity: XY;

  leftPlayer?: PlayerID;
  rightPlayer?: PlayerID;

  leftPlayerReady?: boolean;
  rightPlayerReady?: boolean;
}

export type InteractableID = string;
export type GameInstanceID = string;

export type TargetShooterPlayer = 'player1' | 'player2';

export type TargetShooterScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TargetShooterDifficulty = 'Easy' | 'Medium' | 'Hard';

export type TargetShooterScoreUpdate = {
  gamePiece: TargetShooterPlayer;
  score: TargetShooterScore;
}

export type TargetShooterMove = {
  gamePiece: TargetShooterPlayer;
  position: XY;
}

export type TargetShooterAccuracy = {
  hits: number;
  shots: number;
}


export interface TargetShooterGameState extends WinnableGameState{
  player1Score: TargetShooterScore;
  player2Score: TargetShooterScore;

  currentTarget: XY;

  player1?: PlayerID;
  player2?: PlayerID;

  player1Ready?: boolean;
  player2Ready?: boolean;

  difficulty: TargetShooterDifficulty;
  targetSize: number;

  player1Accuracy: TargetShooterAccuracy;
  player2Accuracy: TargetShooterAccuracy;
}



/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type TicketBoothPurchase = {
  item: BoothItemName;
  player: PlayerID;
}

export type InteractableCommand =  TicketBoothPurchaseCommand | AddTokenCommand | ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<TicTacToeMove> | GameMoveCommand<ConnectFourMove> | GameMoveCommand<PongMove>| GameMoveCommand<TargetShooterMove> | StartUpdatePhysicsCommand | StopUpdatePhysicsCommand | UpdatePongScoreCommand | StartGameCommand | LeaveGameCommand | TicketBoothEquipCommand | ChangeDifficultyCommand;
export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface StartGameCommand {
  type: 'StartGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface TicketBoothPurchaseCommand {
  type: 'TicketBoothPurchase';
  itemName: BoothItemName;
  playerID: PlayerID;
}
export interface TicketBoothEquipCommand {
  type: 'TicketBoothEquip';
  itemName: BoothItemName | undefined;
  playerID: PlayerID;
}
export interface AddTokenCommand {
  type: 'AddToken';
  amount: number;
}
export interface UpdatePongScoreCommand {
  type: 'UpdateScore';
  gameID: GameInstanceID;
  scoreUpdate: PongScoreUpdate;
}
export interface StartUpdatePhysicsCommand {
  type: 'StartUpdatePhysics';
  gameID: GameInstanceID;
}
export interface StopUpdatePhysicsCommand {
  type: 'StopUpdatePhysics';
  gameID: GameInstanceID;
}
export interface ChangeDifficultyCommand {
  type: 'ChangeDifficulty';
  gameID: GameInstanceID;
  difficulty: TargetShooterDifficulty;
}

export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<GameMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  CommandType extends StartGameCommand ? undefined :
  CommandType extends TicketBoothPurchaseCommand ? undefined :
  CommandType extends TicketBoothEquipCommand ? undefined :
  CommandType extends AddTokenCommand ? undefined :
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerTokensChanged: (playerChanged: Player) => void;
  playerItemsChanged: (playerChanged: Player) => void;
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
  playerEquippedChanged: (playerChanged: Player) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
  playerTokenUpdate: (playerID: PlayerID, tokens: number) => void;
}