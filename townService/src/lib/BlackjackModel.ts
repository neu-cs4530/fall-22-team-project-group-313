import Card, { Rank } from './Card';

/**
 * Represents all of the possible moves a blackjack player can make
 */
export enum BlackjackMove {
  Hit = 'Hit',
  Stay = 'Stay',
  Surrender = 'Surrender',
  Split = 'Split',
  Double = 'Double',
}

/**
 * Class representing the current state of a blackjack game.
 */
export default class BlackjackModel {
  private _deck = new Array<Card>();

  // Index of player to move
  public currentMove = 0;

  // Dealer's hand
  private _dealerHand = new Array<Card>();

  // Players' hands
  private _hands: Map<string, Card[][]>;

  // index of the hand the player is working with (0 unless player splits)
  private _currentHandIndex: Map<string, number>;

  // Bets players have on each hand
  private _playerBets: Map<string, number[]>;

  // Number of decks to be used in the game
  private readonly _numDecks: number;

  public players: string[];

  constructor(playerIDs: string[], numDecks?: number) {
    this.players = playerIDs;
    this._numDecks = numDecks ?? 6;
    this._hands = new Map<string, Card[][]>();
    this._currentHandIndex = new Map<string, number>();
    this._playerBets = new Map<string, number[]>();
    playerIDs.forEach(id => {
      this._hands.set(id, []);
      this._currentHandIndex.set(id, 0);
      this._playerBets.set(id, []); // To be updated later
    });
    this._shuffleDeck();
  }

  public get dealerHand() {
    return this._dealerHand;
  }

  private _shuffleDeck(): void {
    this._deck = [];
    const fullDeck = Card.getDeck();
    // Adding cards back into deck
    for (let i = 0; i < this._numDecks; i++) {
      fullDeck.forEach(card => this._deck.push(card));
    }
    // Shuffling (Durnstenfield shuffle, taken from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
    for (let i = this._deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._deck[i], this._deck[j]] = [this._deck[j], this._deck[i]];
    }
  }

  /**
   * Performs a move in this game.
   * @param playerID The ID of the player making a move
   * @param move the Blackjack move the player chooses
   */
  public playerMove(playerID: string, move: BlackjackMove): void {
    if (playerID !== this.players[this.currentMove]) {
      throw new Error('Wrong player moving!');
    }
    let turnOver = false;
    const currentHandIndex = this._currentHandIndex.get(playerID) as number;
    const playerHands = this._hands.get(playerID) as Card[][];
    switch (move) {
      case BlackjackMove.Hit: {
        const nextCard = this._deck.pop() as Card;
        playerHands[currentHandIndex].push(nextCard);
        break;
      }
      case BlackjackMove.Double: {
        const currentHand = playerHands[currentHandIndex];
        // TODO: Throw error if value is not 9-11
        const nextCard = this._deck.pop() as Card;
        nextCard.isFaceUp = false;
        playerHands[currentHandIndex].push(nextCard);
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
        break;
      }
      case BlackjackMove.Stay: {
        this._currentHandIndex.set(playerID, currentHandIndex + 1);
        break;
      }
      case BlackjackMove.Surrender:
        // TODO
        break;
      default:
        throw new Error('Unknown Blackjack move');
    }
    this.currentMove = turnOver ? (this.currentMove + 1) % this.players.length : this.currentMove;
  }

  /**
   * Gets the hand(s) that a player has in this game.
   * @param playerID The player ID in the game
   * @returns the player's hands
   */
  public getPlayerHands(playerID: string): Card[][] {
    if (!(playerID in this._hands.keys())) {
      throw new Error(`${playerID} does not exist in this game`);
    }
    return this._hands.get(playerID) as Card[][];
  }

  /**
   * Plays the dealer's hand out according to the rules.
   */
  public playDealerHand(): void {
    // TODO: Check if all other players are done
    let val = +this.handValue('dealer').slice(-2);
    while (val < 17) {
      const nextCard = this._deck.pop() as Card;
      this._dealerHand.push(nextCard);
      val += nextCard.rank === Rank.Ace && val < 11 ? 11 : nextCard.value;
    }
  }

  /**
   * Computes the string representation of the value of a hand.
   * Non-Ace hands will just be the sum of the values.
   * If the player has one ace, the string will start with an S to represent a soft-hand
   * @param playerID The ID of the player
   */
  public handValue(playerID: string): string {
    let hand: Card[];
    if (playerID === 'dealer') {
      hand = this._dealerHand;
    } else {
      hand = this.getPlayerHands(playerID)[this._currentHandIndex.get(playerID) as number];
    }
    const value = '';
    let total = 0;
    let aceFound = false;
    hand.forEach(card => {
      if (card.rank === Rank.Ace) {
        if (aceFound || total > 11) {
          total += 1;
        } else {
          total += 11;
          aceFound = true;
          value.concat('S');
        }
      } else {
        total += card.value;
      }
    });
    return value.concat(total.toString());
  }
}
