import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GameAction, PlayerLocation } from '../types/CoveyTownSocket';
import BlackjackAreaController, { BlackjackAreaEvents } from './BlackjackAreaController';

describe('[T2] BlackjackAreaController', () => {
  // A valid BlackjackAreaController to be reused within the tests
  let testArea: BlackjackAreaController;
  const mockListeners = mock<BlackjackAreaEvents>();
  beforeEach(() => {
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    // const testGameAction: GameAction = { GameAction: 'test', playerID: 'testID' };
    // testArea = new BlackjackAreaController(nanoid(), testGameAction);
    // testArea.occupants = [
    //   new PlayerController(nanoid(), nanoid(), playerLocation),
    //   new PlayerController(nanoid(), nanoid(), playerLocation),
    //   new PlayerController(nanoid(), nanoid(), playerLocation),
    // ];
    mockClear(mockListeners.occupantsChange);
    mockClear(mockListeners.gameActionChange);
    testArea.addListener('occupantsChange', mockListeners.occupantsChange);
    testArea.addListener('gameActionChange', mockListeners.gameActionChange);
  });
  describe('isEmpty', () => {
    it('Returns true if the occupants list is empty', () => {
      testArea.occupants = [];
      expect(testArea.isEmpty()).toBe(true);
    });
    it('Returns true if the gameAction is undefined', () => {
      testArea.gameAction = undefined;
      expect(testArea.isEmpty()).toBe(true);
    });
    it('Returns false if the occupants list is set and the gameAction is defined', () => {
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
        gameAction: testArea.gameAction,
        occupantsByID: testArea.occupants.map(eachOccupant => eachOccupant.id),
      });
    });
  });
  describe('setting the gameAction property', () => {
    // it('does not update the property if the gameAction is the same', () => {
    //   const gameActionCopy = { GameAction: 'test', playerID: 'testID' };
    //   testArea.gameAction = gameActionCopy;
    //   expect(mockListeners.gameActionChange).not.toBeCalled();
    // });
    // it('emits the gameActionChange event when setting the property and updates the model', () => {
    //   const newGameAction: GameAction = { GameAction: 'newAction', playerID: nanoid() };
    //   testArea.gameAction = newGameAction;
    //   expect(mockListeners.gameActionChange).toBeCalledWith(newGameAction);
    //   expect(testArea.gameAction).toEqual(newGameAction);
    //   expect(testArea.toBlackjackModel()).toEqual({
    //     id: testArea.id,
    //     occupantsByID: testArea.occupants.map(eachOccupant => eachOccupant.id),
    //     gameAction: newGameAction,
    //   });
    // });
  });
});
