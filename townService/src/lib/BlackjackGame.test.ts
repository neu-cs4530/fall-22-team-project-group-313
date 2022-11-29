import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { TownEmitter } from '../types/CoveyTownSocket';
import BlackjackGame, { BlackjackMove, DealerMove } from './BlackjackGame';
import Card, { Suit } from './Card';

import Player from './Player';

describe('BlackjackGame', () => {
  let playerOne: Player;
  let playerTwo: Player;
  let testGame: BlackjackGame;
  let noShuffleGame: BlackjackGame;
  const townEmitter = mock<TownEmitter>();

  beforeEach(() => {
    playerOne = new Player(nanoid(), townEmitter);
    playerTwo = new Player(nanoid(), townEmitter);
    // TODO uncomment and update this setup (added new testGame for now)
    testGame = new BlackjackGame();
    testGame.addPlayer(playerOne.id);
    testGame.dealerAction(DealerMove.StartGame);
    testGame.playerMove(playerOne.id, 'Wager:25' as BlackjackMove);
    noShuffleGame = new BlackjackGame(6, false);
    noShuffleGame.addPlayer(playerOne.id);
    noShuffleGame.dealerAction(DealerMove.StartGame);
    noShuffleGame.playerMove(playerOne.id, 'Wager:25' as BlackjackMove);
  });
  describe('dealerHand', () => {
    it('No-shuffle dealer hand has consistent result after moving', () => {
      noShuffleGame.playerMove(playerOne.id, BlackjackMove.Stay);
      const { dealerHand } = noShuffleGame;
      let sum = 0;
      for (const card of dealerHand) {
        sum += card.value;
      }
      expect(sum).toEqual(20);
    });
  });
  describe('addPlayer', () => {
    it('Adding player to game means hands are defined', () => {
      const newGame = new BlackjackGame();
      newGame.addPlayer('TEST');
      newGame.dealerAction(DealerMove.StartGame);
      expect(newGame.hands.get('TEST')).toBeDefined();
    });
    it('Empty game only contains players added', () => {
      const newGame = new BlackjackGame();
      newGame.addPlayer('TEST');
      newGame.dealerAction(DealerMove.StartGame);
      const { hands } = newGame;
      expect(hands.get('TEST')).toBeDefined();
      expect(hands.get(playerTwo.id)).toBeUndefined();
    });
    it('Adding already existing player to game throws error', () => {
      const newGame = new BlackjackGame();
      newGame.addPlayer('TEST');
      expect(() => newGame.addPlayer('TEST')).toThrowError();
    });
  });
  describe('playerMove', () => {
    // Prepare for a lot of tests
    it('Stay, any move after stay (without split) throws error', () => {
      noShuffleGame.playerMove(playerOne.id, BlackjackMove.Stay);
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Hit)).toThrowError();
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Stay)).toThrowError();
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Double)).toThrowError();
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Split)).toThrowError();
    });
    it('Hit, player gains another card', () => {
      const initLength = (noShuffleGame.hands.get(playerOne.id) as Card[][])[0].length;
      expect(initLength).toEqual(2);
      noShuffleGame.playerMove(playerOne.id, BlackjackMove.Hit);
      const nextLength = (noShuffleGame.hands.get(playerOne.id) as Card[][])[0].length;
      expect(nextLength).toEqual(initLength + 1);
    });
    it('Split, successfully splits when cards are equal in value', () => {
      const card1 = new Card(Suit.C, '10');
      const card2 = new Card(Suit.H, '10');
      noShuffleGame.hands.set(playerOne.id, [[card1, card2]]);
      noShuffleGame.playerMove(playerOne.id, BlackjackMove.Split);
      const splitHands = noShuffleGame.hands.get(playerOne.id) as Card[][];
      expect(splitHands.length).toEqual(2);
      expect(splitHands[0][0]).toEqual(card1);
      expect(splitHands[1][0]).toEqual(card2);
    });
    it('Split, Splitting when values do not match throws error', () => {
      const card1 = new Card(Suit.C, '10');
      const card2 = new Card(Suit.H, '9');
      noShuffleGame.hands.set(playerOne.id, [[card1, card2]]);
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Split)).toThrowError();
    });
    it('Wager, last wager causes dealing to begin', () => {
      // TODO
    });
    it('Double, doubling throws an error when hand val not between 9 and 11', () => {
      expect(() => noShuffleGame.playerMove(playerOne.id, BlackjackMove.Double)).toThrowError();
    });
  });
  describe('playerBets', () => {
    it('Blackjack returns 1.5x the bet', () => {
      const card1 = new Card(Suit.C, '10');
      const card2 = new Card(Suit.H, 'A');
      noShuffleGame.hands.set(playerOne.id, [[card1, card2]]);
      noShuffleGame.playerMove(playerOne.id, BlackjackMove.Stay);
      const model = noShuffleGame.toModel();
      expect(model.playerPoints[0]).toEqual(137.5);
    });
  });
  describe('dealerAction', () => {
    it('StartGame clears out existing hands', () => {
      expect((testGame.hands.get(playerOne.id) as Card[][])[0].length).toEqual(2);
      testGame.dealerAction(DealerMove.StartGame);
      expect((testGame.hands.get(playerOne.id) as Card[][])[0].length).toEqual(0);
    });
  });
});
