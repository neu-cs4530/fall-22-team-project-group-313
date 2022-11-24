import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import BlackjackGame, { BlackjackMove, DealerMove } from '../lib/BlackjackGame';
import Player from '../lib/Player';
import {
  GameAction,
  BoundingBox,
  BlackjackArea as BlackjackModel,
  TownEmitter,
  BlackjackGame as BlackjackGameModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class BlackjackArea extends InteractableArea {
  /* The number of decks set in the blackjack area, or undefined if it is not set */
  public gameAction?: GameAction;

  public game: BlackjackGame;

  public gameOccupantsByID: string[] = [];

  /** The blackjack area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new BlackjackArea
   *
   * @param BlackjackModel model containing this area's current number of decks and its ID
   * @param coordinates  the bounding box that defines this blackjack area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, gameAction }: BlackjackModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.gameAction = gameAction;
    this.game = new BlackjackGame(this.gameOccupantsByID);
  }

  /**
   * Removes a player from this game area.
   *
   * Extends the base behavior of InteractableArea to set the number of decks of this GameArea
   * to undefined and emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this.gameAction = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this BlackjackArea, setting the gameAction properties
   *
   * @param blackjackArea updated model
   */
  public updateModel(newModel: BlackjackModel) {
    const occupants = newModel.gameOccupantsByID;
    const addedOccupants = occupants.filter(id => this.gameOccupantsByID.indexOf(id) === -1); // Occupants added
    addedOccupants.forEach(id => this.game.addPlayer(id));
    const removedOccupants = this.gameOccupantsByID.filter(id => occupants.indexOf(id) === -1); // Occupants removed
    removedOccupants.forEach(id => this.game.removePlayer(id));
    this.gameOccupantsByID = newModel.gameOccupantsByID;
    const newAction = newModel.gameAction;
    if (this.gameAction?.index !== newAction?.index) {
      if (newAction?.playerID === 'DEALER') {
        this.game.dealerAction(newAction.GameAction as DealerMove);
      } else {
        this.game.playerMove(newAction?.playerID as string, newAction?.GameAction as BlackjackMove);
      }
      this.gameAction = newModel.gameAction;
    }
    console.log('Update Model: ', this.toModel());
    this._emitAreaChanged();
  }

  /**
   * Convert this BlackjackArea instance to a simple BlackjackModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): BlackjackModel {
    return {
      id: this.id,
      occupantsByID: this.occupantsByID,
      gameOccupantsByID: this.gameOccupantsByID,
      game: this.game.toModel(),
      gameAction: this.gameAction,
    };
  }

  /**
   * Creates a new BlackjackArea object that will represent a Blackjack Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this blackjack area exists
   * @param broadcastEmitter An emitter that can be used by this blackjack area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): BlackjackArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    const game = new BlackjackGame([]);
    return new BlackjackArea(
      {
        id: name,
        occupantsByID: [],
        gameOccupantsByID: [],
        game: game.toModel(),
        gameAction: { GameAction: 'gameStart', playerID: '-1', index: -1 },
      },
      rect,
      broadcastEmitter,
    );
  }
}
