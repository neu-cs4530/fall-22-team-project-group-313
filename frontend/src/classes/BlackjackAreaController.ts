import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import {
  BlackjackArea as BlackjackModel,
  BlackjackGame as BlackjackGameModel,
  Card,
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
  handsChange: (newHands: Map<string, Card[][]>) => void;
  pointsChange: (newPoints: Map<string, number>) => void;
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

  get game() {
    return this._game;
  }

  set game(game: BlackjackGameModel) {
    if (
      _.xor(Object.keys(this._game.hands), Object.keys(game.hands)).length > 0 ||
      _.xor(Object.values(this._game.hands), Object.values(game.hands)).length > 0
    ) {
      this._game.hands = game.hands;
      this.emit('handsChange', game.hands);
    }
    if (
      _.xor(Object.keys(this._game.playerPoints), Object.keys(game.playerPoints)).length > 0 ||
      _.xor(Object.values(this._game.playerPoints), Object.values(game.playerPoints)).length > 0
    ) {
      this._game.playerPoints = game.playerPoints;
      this.emit('pointsChange', game.playerPoints);
    }
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
      this.emit('occupantsChange', newOccupants);
      this._occupants = newOccupants;
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
 * A react hook to retrieve the occupants of a BlackjackAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function useBlackjackAreaOccupants(area: BlackjackAreaController): PlayerController[] {
  const [occupants, setOccupants] = useState(area.occupants);
  useEffect(() => {
    area.addListener('occupantsChange', setOccupants);
    return () => {
      area.removeListener('occupantsChange', setOccupants);
    };
  }, [area]);
  return occupants;
}

/**
 * A react hook to retrieve the gameAction of a BlackjackAreaController.
 * If there is currently no gameAction defined, it will return undefined.
 *
 * This hook will re-render any components that use it when the gameAction changes.
 */
export function useBlackjackAreaGameAction(area: BlackjackAreaController): GameAction | undefined {
  const [gameAction, setGameAction] = useState(area.gameAction);
  useEffect(() => {
    area.addListener('gameActionChange', setGameAction);
    return () => {
      area.removeListener('gameActionChange', setGameAction);
    };
  }, [area]);
  return gameAction;
}

/**
 * A react hook to retrieve the hands of a BlackjackAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function useAllHands(area: BlackjackAreaController): Map<string, Card[][]> {
  const [allHands, setAllHands] = useState(area.game.hands);
  useEffect(() => {
    area.addListener('handsChange', setAllHands);
    return () => {
      area.removeListener('handsChange', setAllHands);
    };
  }, [area]);
  return allHands;
}

/**
 * A react hook to retrieve the player points of a BlackjackAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function usePlayerPoints(area: BlackjackAreaController): Map<string, number> {
  const [playerPoints, setPlayerPoints] = useState(area.game.playerPoints);
  useEffect(() => {
    area.addListener('pointsChange', setPlayerPoints);
    return () => {
      area.removeListener('pointsChange', setPlayerPoints);
    };
  }, [area]);
  return playerPoints;
}
