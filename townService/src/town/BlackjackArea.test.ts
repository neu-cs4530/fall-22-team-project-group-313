import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import BlackjackGame from '../lib/BlackjackGame';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { GameAction, TownEmitter } from '../types/CoveyTownSocket';
import BlackjackArea from './BlackjackArea';

describe('BlackjackArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: BlackjackArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  const gameAction: GameAction = { GameAction: 'gameStart', playerID: '-1', index: -1 };
  const testGame = new BlackjackGame();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new BlackjackArea(
      { id, occupantsByID: [], gameOccupantsByID: [], game: testGame.toModel(), gameAction },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupantsByID: [newPlayer.id],
        game: testGame.toModel(),
        gameOccupantsByID: [],
        gameAction,
      });
    });
    it("Sets the player's blackjackLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupantsByID: [extraPlayer.id],
        game: testGame.toModel(),
        gameOccupantsByID: [],
        gameAction,
      });
    });
    it("Clears the player's blackjackLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the gameAction of the blackjack area when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupantsByID: [],
        game: testGame.toModel(),
        gameOccupantsByID: [],
        gameAction: undefined,
      });
      expect(testArea.gameAction).toBeUndefined();
    });
  });
  test('toModel sets ID, occupantsByID, game, gameOccupantsByID, gameAction and no other properties', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      occupantsByID: [newPlayer.id],
      game: testGame.toModel(),
      gameOccupantsByID: [],
      gameAction,
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        BlackjackArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new blackjack area using the provided boundingBox and id, with an empty occupants list', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = BlackjackArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.gameAction).toEqual(gameAction);
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
