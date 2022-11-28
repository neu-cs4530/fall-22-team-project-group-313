import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { TownEmitter } from '../types/CoveyTownSocket';
import BlackjackGame, { BlackjackMove } from './BlackjackGame';

import Player from './Player';

describe('BlackjackGame', () => {
  let playerOne: Player;
  let playerTwo: Player;
  let playerThree: Player;
  let testGame: BlackjackGame;
  let noShuffleGame: BlackjackGame;
  const townEmitter = mock<TownEmitter>();

  beforeEach(() => {
    playerOne = new Player(nanoid(), townEmitter);
    playerTwo = new Player(nanoid(), townEmitter);
    playerThree = new Player(nanoid(), townEmitter);
    // TODO uncomment and update this setup (added new testGame for now)
    // testGame = new BlackjackGame([playerOne.id, playerTwo.id, playerThree.id]);
    // noShuffleGame = new BlackjackGame([playerOne.id, playerTwo.id], undefined, false);
    testGame = new BlackjackGame();
  });

  describe('setBet', () => {
    // it('At start, bet for the first hand can be set', () => {
    //   testGame.setBet(playerOne.id, 10);
    // });
    // it('Setting the bet when not needed throws an error', () => {
    //   testGame.setBet(playerOne.id, 10);
    //   expect(() => testGame.setBet(playerOne.id, 20)).toThrowError();
    // });
    it('Setting a non-positive bet throws an error', () => {
      expect(() => testGame.setBet(playerOne.id, 0)).toThrowError();
      expect(() => testGame.setBet(playerOne.id, -1)).toThrowError();
    });
  });
  // describe('dealerHand', () => {
  //   it('Dealer has one face-up and one face-down card at start', () => {
  //     const { dealerHand } = testGame;
  //     expect(dealerHand[0].isFaceUp).toBeTruthy();
  //     expect(dealerHand[1].isFaceUp).toBeFalsy();
  //   });
  // });
  // describe('getPlayerHands', () => {
  //   it('Retrieving hand provides a hand with 2 face-up cards', () => {
  //     const pOneHand = testGame.getPlayerHands(playerOne.id);
  //     const hand = pOneHand[0];
  //     expect(hand[0].isFaceUp).toBeTruthy();
  //     expect(hand[1].isFaceUp).toBeTruthy();
  //   });
  // });
  // describe('handValue', () => {
  //   it('Starting hands are between 4 and 21', () => {
  //     const handOneVal = testGame.handValues(playerOne.id)[0];
  //     const handTwoVal = testGame.handValues(playerTwo.id)[0];
  //     const handThreeVal = testGame.handValues(playerThree.id)[0];
  //     expect(handOneVal).toBeGreaterThanOrEqual(4);
  //     expect(handOneVal).toBeLessThanOrEqual(21);
  //     expect(handTwoVal).toBeGreaterThanOrEqual(4);
  //     expect(handTwoVal).toBeLessThanOrEqual(21);
  //     expect(handThreeVal).toBeGreaterThanOrEqual(4);
  //     expect(handThreeVal).toBeLessThanOrEqual(21);
  //   });
  // it('In not shuffled game, hands have set values', () => {
  //   const handOneVal = noShuffleGame.handValues(playerOne.id)[0];
  //   const handTwoVal = noShuffleGame.handValues(playerTwo.id)[0];
  //   expect(handOneVal).toEqual(20);
  //   expect(handTwoVal).toEqual(20);
  // });
  // });
  // describe('players', () => {
  //   it('Players contains initial starting value', () => {
  //     expect(testGame.players[0]).toEqual(playerOne.id);
  //     expect(testGame.players[1]).toEqual(playerTwo.id);
  //     expect(testGame.players[2]).toEqual(playerThree.id);
  //   });
  // });
  // TODO: Test splitting and such
  // describe('playerMoveIndex', () => {

  // });
  describe('playerMove', () => {
    // Prepare for a lot of tests
    // it('Stay, player turn increases', () => {
    //   expect(testGame.playerMoveIndex).toEqual(0);
    //   testGame.playerMove(playerOne.id, BlackjackMove.Stay);
    //   expect(testGame.playerMoveIndex).toEqual(1);
    // });
    // it('Hit, hand value increases in no shuffle game', () => {
    //   // console.log(noShuffleGame._deck);
    //   // console.log(noShuffleGame.getPlayerHands(playerOne.id)[0]);
    //   const handOneVal = noShuffleGame.handValues(playerOne.id)[0];
    //   expect(handOneVal).toEqual(20);
    //   noShuffleGame.playerMove(playerOne.id, BlackjackMove.Hit);
    //   expect(+noShuffleGame.handValues(playerOne.id)[0]).toEqual(30);
    // });
    // it('Hit, hand gains another card', () => {
    //   const oldHand = testGame.getPlayerHands(playerOne.id)[0];
    //   testGame.playerMove(playerOne.id, BlackjackMove.Hit);
    //   const newHand = testGame.getPlayerHands(playerOne.id)[0];
    //   expect(newHand.length).toEqual(oldHand.length + 1);
    // });
    // it('Split, splitting generates two hands with the first two cards being identical', () => {
    //   const oldHands = noShuffleGame.getPlayerHands(playerOne.id);
    //   expect(oldHands.length).toEqual(1);
    //   noShuffleGame.playerMove(playerOne.id, BlackjackMove.Split);
    //   const newHands = noShuffleGame.getPlayerHands(playerOne.id);
    //   expect(newHands.length).toEqual(2);
    //   expect(newHands[0][0].value).toEqual(newHands[1][0].value);
    // });
    it('Double, doubling throws an error when hand val not between 9 and 11', () => {
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Double)).toThrowError();
    });
  });
});
