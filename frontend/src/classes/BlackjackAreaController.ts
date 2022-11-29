import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import {
  BlackjackArea as BlackjackModel,
  BlackjackGame as BlackjackGameModel,
  GameAction,
} from '../types/CoveyTownSocket';
import PlayerController from './PlayerController';

/**
 * The events that the BlackjackAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type BlackjackAreaEvents = {
  gameActionChange: (newAction: GameAction | undefined) => void;
  occupantsChange: (newOccupants: PlayerController[]) => void;
  gameOccupantsChange: (newGameOccupants: PlayerController[]) => void;
  gameChange: (game: BlackjackGameModel) => void;
};

/**
 * A BlackjackAreaController manages the local behavior of a blackjack area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of blackjack areas and the
 * frontend's. The BlackjackAreaController emits events when the blackjack area changes.
 */
export default class BlackjackAreaController extends (EventEmitter as new () => TypedEmitter<BlackjackAreaEvents>) {
  private _occupants: PlayerController[] = [];

  private _gameOccupants: PlayerController[] = [];

  private _id: string;

  private _game: BlackjackGameModel;

  private _gameAction?: GameAction;

  /**
   * Create a new BlackjackAreaController
   * @param id
   * @param gameAction
   */
  constructor(id: string, game: BlackjackGameModel, gameAction?: GameAction) {
    super();
    this._id = id;
    this._game = game;
    this._gameAction = gameAction;
  }

  /**
   * The ID of this blackjack area (read only)
   */
  get id() {
    return this._id;
  }

  /**
   * Returns the ID of the game
   */
  get game() {
    return this._game;
  }

  /**
   * Sets the ID of the game and emits a gameChange event to listeners
   */
  set game(game: BlackjackGameModel) {
    this._game = game;
    this.emit('gameChange', game);
  }

  /**
   * The list of occupants in this blackjack area. Changing the set of occupants
   * will emit an occupantsChange event.
   */
  set occupants(newOccupants: PlayerController[]) {
    if (
      newOccupants.length !== this._occupants.length ||
      _.xor(newOccupants, this._occupants).length > 0
    ) {
      this._occupants = newOccupants;
      this.emit('occupantsChange', newOccupants);
    }
  }

  get occupants() {
    return this._occupants;
  }

  set gameOccupants(newGameOccupants: PlayerController[]) {
    if (
      newGameOccupants.length !== this._gameOccupants.length ||
      _.xor(newGameOccupants, this._gameOccupants).length > 0
    ) {
      this.emit('gameOccupantsChange', newGameOccupants);
      this._occupants = newGameOccupants;
    }
  }

  get gameOccupants() {
    return this._gameOccupants;
  }

  /**
   * The gameAction of the blackjack area. Changing the gameAction will emit a gameActionChange event
   *
   * Setting the gameAction to the value `undefined` will indicate that the blackjack area is not active
   */
  set gameAction(newAction: GameAction | undefined) {
    if (
      this._gameAction?.GameAction !== newAction?.GameAction ||
      this._gameAction?.playerID !== newAction?.playerID
    ) {
      this.emit('gameActionChange', newAction);
    }
    this._gameAction = newAction;
  }

  get gameAction(): GameAction | undefined {
    return this._gameAction;
  }

  /**
   * A blackjack area is empty if there are no occupants in it.
   */
  isEmpty(): boolean {
    return this._gameAction === undefined || this._occupants.length === 0;
  }

  /**
   * Return a representation of this BlackjackAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toBlackjackModel(): BlackjackModel {
    return {
      id: this.id,
      occupantsByID: this.occupants.map(player => player.id),
      gameOccupantsByID: this.gameOccupants.map(player => player.id),
      game: this.game,
      gameAction: this.gameAction,
    };
  }

  /**
   * Create a new BlackjackAreaController to match a given BlackjackAreaModel
   * @param blackjackModel Blackjack area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromBlackjackModel(
    blackjackModel: BlackjackModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): BlackjackAreaController {
    const ret = new BlackjackAreaController(
      blackjackModel.id,
      blackjackModel.game,
      blackjackModel.gameAction,
    );
    ret.occupants = playerFinder(blackjackModel.occupantsByID);
    ret.gameOccupants = playerFinder(blackjackModel.gameOccupantsByID);
    return ret;
  }
}

/**
 * Updates the current controller
 * @param area New BlackjackAreaController
 * @returns BlackjackAreaController
 */
export function useGame(area: BlackjackAreaController): BlackjackGameModel {
  const [game, setGame] = useState(area.game);
  useEffect(() => {
    area.addListener('gameChange', setGame);
    return () => {
      area.removeListener('gameChange', setGame);
    };
  }, [area]);
  return game;
}
