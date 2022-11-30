import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  BlackjackGame as BlackjackGameModel,
  GameAction,
  PlayerLocation,
} from '../types/CoveyTownSocket';
import BlackjackAreaController, { BlackjackAreaEvents } from './BlackjackAreaController';
import PlayerController from './PlayerController';

describe('[T2] BlackjackAreaController', () => {
  // A valid BlackjackAreaController to be reused within the tests
  let testArea: BlackjackAreaController;
  let testModel: BlackjackGameModel;
  let testGameAction: GameAction;
  let testPlayer1: PlayerController;
  const mockListeners = mock<BlackjackAreaEvents>();
  beforeEach(() => {
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    testModel = {
      hands: [],
      playerPoints: [],
      playerBets: [],
      playerMoveID: '',
      players: [],
      queue: [],
      isStarted: false,
      dealerHand: [],
      results: [],
    };
    testGameAction = { GameAction: 'gameStart', playerID: '-1', index: -1 };
    testPlayer1 = new PlayerController(nanoid(), nanoid(), playerLocation);
    testArea = new BlackjackAreaController(nanoid(), testModel, testGameAction);
    testArea.occupants = [
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
    ];
    mockClear(mockListeners.occupantsChange);
    mockClear(mockListeners.gameActionChange);
    mockClear(mockListeners.gameOccupantsChange);
    mockClear(mockListeners.gameChange);
    testArea.addListener('occupantsChange', mockListeners.occupantsChange);
    testArea.addListener('gameActionChange', mockListeners.gameActionChange);
    testArea.addListener('gameOccupantsChange', mockListeners.gameOccupantsChange);
    testArea.addListener('gameChange', mockListeners.gameChange);
  });
  describe('isEmpty', () => {
    it('Returns false if there are occupants set', () => {
      expect(testArea.isEmpty()).toBe(false);
    });
    it('Returns true if gameAction is undefined', () => {
      testArea.gameAction = undefined;
      expect(testArea.isEmpty()).toBe(true);
    });
    it('Returns true if the occupants list is empty', () => {
      testArea.occupants = [];
      expect(testArea.isEmpty()).toBe(true);
    });
    it('Returns false if gameAction is set', () => {
      expect(testArea.isEmpty()).toBe(false);
    });
  });
  describe('setting the occupants property', () => {
    it('does not update the property if the new occupants are the same set as the old', () => {
      const origOccupants = testArea.occupants;
      const occupantsCopy = testArea.occupants.concat([]);
      const shuffledOccupants = occupantsCopy.reverse();
      testArea.occupants = shuffledOccupants;
      expect(testArea.occupants).toEqual(origOccupants);
      expect(mockListeners.occupantsChange).not.toBeCalled();
    });
    it('emits the occupantsChange event when setting the property and updates the model', () => {
      const newOccupants = testArea.occupants.slice(1);
      testArea.occupants = newOccupants;
      expect(testArea.occupants).toEqual(newOccupants);
      expect(mockListeners.occupantsChange).toBeCalledWith(newOccupants);
      expect(testArea.toBlackjackModel()).toEqual({
        id: testArea.id,
        occupantsByID: testArea.occupants.map(eachOccupant => eachOccupant.id),
        gameOccupantsByID: testArea.gameOccupants.map(player => player.id),
        game: testArea.game,
        gameAction: testArea.gameAction,
      });
    });
  });
  describe('setting the gameOccupants property', () => {
    it('does not update the property if the new occupants are the same set as the old', () => {
      const origOccupants = testArea.gameOccupants;
      const occupantsCopy = testArea.gameOccupants.concat([]);
      const shuffledOccupants = occupantsCopy.reverse();
      testArea.gameOccupants = shuffledOccupants;
      expect(testArea.gameOccupants).toEqual(origOccupants);
      expect(mockListeners.gameOccupantsChange).not.toBeCalled();
    });
    it('emits the gameOccupantsChange event when setting the property and updates the model', () => {
      const newOccupants = [testPlayer1];
      testArea.gameOccupants = newOccupants;
      expect(testArea.occupants).toEqual(newOccupants);
      expect(mockListeners.gameOccupantsChange).toBeCalledWith(newOccupants);
      expect(testArea.toBlackjackModel()).toEqual({
        id: testArea.id,
        occupantsByID: testArea.occupants.map(eachOccupant => eachOccupant.id),
        gameOccupantsByID: testArea.gameOccupants.map(player => player.id),
        game: testArea.game,
        gameAction: testArea.gameAction,
      });
    });
  });
  describe('setting the gameAction property', () => {
    it('does not update the property if the gameAction is the same', () => {
      const gameActionCopy = { GameAction: 'gameStart', playerID: '-1', index: -1 };
      testArea.gameAction = gameActionCopy;
      expect(mockListeners.gameActionChange).not.toBeCalled();
    });
    it('emits the gameActionChange event when setting the property and updates the model', () => {
      const newGameAction = { GameAction: 'hit', playerID: '-1', index: -1 };
      testArea.gameAction = newGameAction;
      expect(mockListeners.gameActionChange).toBeCalledWith(newGameAction);
      expect(testArea.gameAction).toEqual(newGameAction);
      expect(testArea.toBlackjackModel()).toEqual({
        id: testArea.id,
        occupantsByID: testArea.occupants.map(eachOccupant => eachOccupant.id),
        gameOccupantsByID: testArea.gameOccupants.map(player => player.id),
        game: testArea.game,
        gameAction: newGameAction,
      });
    });
  });
  describe('setting the game property', () => {
    it('emits the game event when setting the property and updates the model', () => {
      const newModel: BlackjackGameModel = {
        hands: [],
        playerPoints: [],
        playerBets: [],
        playerMoveID: '',
        players: [],
        queue: ['Sean'],
        isStarted: true,
        dealerHand: [],
        results: [],
      };
      testArea.game = newModel;
      expect(mockListeners.gameChange).toBeCalledWith(newModel);
      expect(testArea.game).toEqual(newModel);
      expect(testArea.toBlackjackModel()).toEqual({
        id: testArea.id,
        occupantsByID: testArea.occupants.map(eachOccupant => eachOccupant.id),
        gameOccupantsByID: testArea.gameOccupants.map(player => player.id),
        game: newModel,
        gameAction: testArea.gameAction,
      });
    });
  });
});
