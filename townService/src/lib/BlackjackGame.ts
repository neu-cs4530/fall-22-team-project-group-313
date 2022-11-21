import { cloneDeep } from 'lodash';
import Card from './Card';

/**
 * Represents all of the possible moves a blackjack player can make
 */
export enum BlackjackMove {
  Hit = 'Hit',
  Stay = 'Stay',
  Leave = 'Surrender',
  Split = 'Split',
  Double = 'Double',
}

/**
 * Class representing the current state of a blackjack game.
 */
export default class BlackjackGame {
  private _deck = new Array<Card>();

  // Index of player to move
  public playerMoveIndex: number;

  // Dealer's hand
  private _dealerHand = new Array<Card>();

  // Players' hands
  private _hands: Map<string, Card[][]>;

  // index of the hand the player is working with (0 unless player splits)
  private _currentHandIndex: Map<string, number>;

  // Bets players have on each hand
  private _playerBets: Map<string, number[]>;

  // Player balances
  public playerPoints: Map<string, number>;

  // Index of players' hands that need to be bet on, if any
  private _handsAwaitingBet: Map<string, number | undefined>;

  // Number of decks to be used in the game
  private readonly _numDecks: number;

  public players: string[];

  // Queue to join next round
  private _newPlayers: string[];

  constructor(playerIDs: string[], numDecks?: number, shuffle?: boolean) {
    this.players = playerIDs;
    this.playerMoveIndex = 0;
    this._numDecks = numDecks ?? 6;
    this._hands = new Map<string, Card[][]>();
    this._currentHandIndex = new Map<string, number>();
    this._playerBets = new Map<string, number[]>();
    this._handsAwaitingBet = new Map<string, number | undefined>();
    this.playerPoints = new Map<string, number>();
    this._newPlayers = [];
    this.resetGame(shuffle);
  }

  public get hands() {
    return this._hands;
  }

  public set hands(hands: Map<string, Card[][]>) {
    this.hands = hands;
  }

  public get playerBets() {
    return this._playerBets;
  }

  public set playerBets(hands: Map<string, number[]>) {
    this.playerBets = hands;
  }

  public get dealerHand() {
    return this._dealerHand;
  }

  private _initializeDeck(shuffle: boolean): void {
    this._deck = [];
    const fullDeck = Card.getDeck();
    // Adding cards back into deck
    for (let i = 0; i < this._numDecks; i++) {
      fullDeck.forEach(card => this._deck.push(card));
    }
    if (!shuffle) {
      return;
    }
    // Shuffling (Durnstenfield shuffle, taken from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
    for (let i = this._deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._deck[i], this._deck[j]] = [this._deck[j], this._deck[i]];
    }
  }

  private _deal(): void {
    for (let i = 0; i < 2; i++) {
      this.players.forEach(id => {
        const hands = this._hands.get(id) as Card[][];
        const hand = hands[0];
        hand.push(this._deck.pop() as Card);
      });
      const dealerCard = this._deck.pop() as Card;
      dealerCard.isFaceUp = i === 0;
      this._dealerHand.push(dealerCard);
    }
  }

  /**
   * Resets the game cards and deals hands again
   * @param shuffle if the game should be shuffled or not
   */
  public resetGame(shuffle?: boolean) {
    this._initializeDeck(shuffle ?? true);
    this.players.push(...this._newPlayers);
    this._newPlayers = [];
    this.players.forEach(id => {
      this.playerPoints.set(id, 0);
      this._hands.set(id, [[]]);
      this._currentHandIndex.set(id, 0);
      this._playerBets.set(id, []); // To be updated later
      this._handsAwaitingBet.set(id, 0);
    });
    this._deal();
  }

  /**
   * Adds this player to the queue to join the game next round
   * @param playerID Player ID to be joining
   */
  public addPlayer(playerID: string) {
    if (this.players.includes(playerID) || this._newPlayers.includes(playerID)) {
      throw new Error('Player has already been added to this game!');
    }
    this._newPlayers.push(playerID);
  }

  /**
   * Performs a move in this game.
   * @param playerID The ID of the player making a move
   * @param move the Blackjack move the player chooses
   */
  public playerMove(playerID: string, move: BlackjackMove): void {
    if (playerID !== this.players[this.playerMoveIndex]) {
      throw new Error('Wrong player moving!');
    }
    let turnOver = false;
    let currentHandIndex = this._currentHandIndex.get(playerID) as number;
    const playerHands = this._hands.get(playerID) as Card[][];
    switch (move) {
      case BlackjackMove.Hit: {
        const nextCard = this._deck.pop() as Card;
        playerHands[currentHandIndex].push(nextCard);
        const currentVal = this.handValues(playerID)[0];
        if (currentVal >= 21) {
          currentHandIndex += 1;
          this._currentHandIndex.set(playerID, currentHandIndex);
          turnOver = currentHandIndex === this._hands.get(playerID)?.length;
        }
        break;
      }
      case BlackjackMove.Double: {
        const currentHand = playerHands[currentHandIndex];
        const currentHandVal = this.handValues(playerID)[currentHandIndex];
        if (currentHandVal > 11 || currentHandVal < 9) {
          throw new Error('Hand value must be between 9 and 11!');
        }
        // TODO: Throw error if value is not 9-11
        const nextCard = this._deck.pop() as Card;
        nextCard.isFaceUp = false;
        currentHand.push(nextCard);
        this._currentHandIndex.set(playerID, currentHandIndex + 1);
        const bets = this._playerBets.get(playerID) as number[];
        bets[currentHandIndex] *= 2;
        turnOver = true;
        break;
      }
      case BlackjackMove.Split: {
        const initHand = playerHands[currentHandIndex];
        if (initHand[0].value !== initHand[1].value) {
          throw new Error("Player's card values do not match!");
        }
        const secondHand = initHand.slice(0, 1);
        playerHands[currentHandIndex].splice(1, 1);
        playerHands.push(secondHand);
        this._handsAwaitingBet.set(playerID, playerHands.length - 1);
        break;
      }
      case BlackjackMove.Stay: {
        currentHandIndex += 1;
        this._currentHandIndex.set(playerID, currentHandIndex);
        turnOver = currentHandIndex === this._hands.get(playerID)?.length;
        break;
      }
      case BlackjackMove.Leave: {
        // TODO
        this.players.slice(this.players.indexOf(playerID), 1);
        this._hands.delete(playerID);
        this._currentHandIndex.delete(playerID);
        this._handsAwaitingBet.delete(playerID);
        this._playerBets.delete(playerID);
        // this._playerPoints.delete(playerID);
        // Don't say turnOver = true as index should autocompensate
        break;
      }
      default:
        throw new Error('Unknown Blackjack move');
    }
    this.playerMoveIndex += turnOver ? 1 : 0;
  }

  /**
   * Gets the hand(s) that a player has in this game.
   * @param playerID The player ID in the game
   * @returns the player's hands
   */
  public getPlayerHands(playerID: string): Card[][] {
    if (!this.players.includes(playerID)) {
      throw new Error(`${playerID} does not exist in this game`);
    }
    return cloneDeep(this._hands.get(playerID) as Card[][]);
  }

  /**
   * Plays the dealer's hand out according to the rules.
   */
  public playDealerHand(): void {
    if (this.playerMoveIndex < this.players.length) {
      throw new Error('Not the dealers turn!');
    }
    let val = +this.handValues('dealer').slice(-2);
    while (val < 17) {
      const nextCard = this._deck.pop() as Card;
      this._dealerHand.push(nextCard);
      val += nextCard.value === 11 && val < 11 ? 11 : nextCard.value;
    }
  }

  /**
   * Computes the highest value the hand can have under 21.
   * @param playerID The ID of the player (or 'dealer')
   */
  public handValues(playerID: string): number[] {
    let hands: Card[][];
    const totals: number[] = [];
    if (playerID === 'dealer') {
      hands = [this._dealerHand];
    } else {
      hands = this.getPlayerHands(playerID);
    }
    hands.forEach(hand => {
      let total = 0;
      let aceCount = 0;
      hand.forEach(card => {
        total += card.value;
        if (card.value === 11) {
          aceCount += 1;
        }
      });
      while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount -= 1;
      }
      totals.push(total);
    });
    return totals;
  }

  /**
   * Sets the bet of the player hand, if applicable
   * @param playerID the player awaiting a bet
   * @param bet how much money to bet
   */
  public setBet(playerID: string, bet: number): void {
    const awaitingBet = this._handsAwaitingBet.get(playerID);
    if (this._handsAwaitingBet.get(playerID) === undefined) {
      throw new Error('Player is not awaiting a bet!');
    }
    if (bet <= 0) {
      throw new Error('Bet must be positive!');
    }
    const maxBet = (this.playerPoints.get(playerID) as number) / 2;
    if (bet > maxBet) {
      throw new Error('Bet must not be greater than half the current points!');
    }
    this._handsAwaitingBet.set(playerID, undefined);
    const currentBets = this._playerBets.get(playerID) as number[];
    currentBets[awaitingBet as number] = bet;
    this._playerBets.set(playerID, currentBets);
  }

  // Once the game is over, distributes the points accordingly
  // Currently doesn't do anything with the dealer's points
  private _handleBets(): void {
    const dealerHandVal = this.handValues('dealer')[0];
    this.players.forEach(id => {
      const handVals = this.handValues(id);
      const bets = this._playerBets.get(id) as number[];
      let points = this.playerPoints.get(id) as number;
      handVals.forEach((val, index) => {
        if (val > 21 || val < dealerHandVal) {
          // TODO: lose
          points -= bets[index];
        } else if (val > dealerHandVal) {
          // TODO: win
          points += bets[index] * 1.5; // TODO: Check if blackjack
        }
      });
      this.playerPoints.set(id, points);
    });
  }
}
