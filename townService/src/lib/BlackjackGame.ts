import Card from './Card';

/**
 * Represents all of the possible moves a blackjack player can make
 */
export enum BlackjackMove {
  Hit = 'Hit',
  Stay = 'Stay',
  Leave = 'Leave',
  Split = 'Split',
  Double = 'Double',
  Join = 'Join',
}

/**
 * Represents all of the possible moves a blackjack dealer can make
 */
export enum DealerMove {
  StartGame = 'StartGame',
  EndGame = 'EndGame',
  PlayHand = 'PlayHand',
}

/**
 * Class representing the current state of a blackjack game.
 */
export default class BlackjackGame {
  // Limit of players
  readonly PLAYERLIMIT = 5;

  // Reshuffle when deck goes below this fraction of original capacity
  readonly SHUFFLELIMIT = 1 / 4;

  // Deck
  private _deck = new Array<Card>();

  // Dealer's hand
  private _dealerHand = new Array<Card>();

  // Players' hands
  private _hands: Map<string, Card[][]>;

  // Index of the hand the player is working with (0 unless player splits)
  private _currentHandIndex: Map<string, number>;

  // Bets players have on each hand
  private _playerBets: Map<string, number[]>;

  // Index of players' hands that need to be bet on, if any
  private _handsAwaitingBet: Map<string, number | undefined>;

  // Number of decks to be used in the game
  private readonly _numDecks: number;

  // Players playing in the blackjack game
  private _players: string[];

  // Queue to join next round
  private _newPlayers: string[];

  // If the game should shuffle the deck upon resetting
  private _shouldShuffle: boolean;

  // Index of player to move
  private _playerMoveIndex: number;

  // Player balances
  private _playerPoints: Map<string, number>;

  // Is the game in progress?
  private _gameInProgress = false;

  // Results of the last round
  private _results: Map<string, string[]>;

  constructor(numDecks?: number, shuffle?: boolean) {
    this._players = [];
    this._playerMoveIndex = -1;
    this._numDecks = numDecks ?? 6;
    this._hands = new Map<string, Card[][]>();
    this._currentHandIndex = new Map<string, number>();
    this._playerBets = new Map<string, number[]>();
    this._handsAwaitingBet = new Map<string, number | undefined>();
    this._playerPoints = new Map<string, number>();
    this._newPlayers = [];
    this._shouldShuffle = shuffle ?? true;
    this._results = new Map<string, string[]>();
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
      this._players.forEach(id => {
        const hands = this._hands.get(id) as Card[][];
        const hand = hands[0];
        hand.push(this._deck.pop() as Card);
      });
      const dealerCard = this._deck.pop() as Card;
      dealerCard.isFaceUp = i === 0;
      this._dealerHand.push(dealerCard);
    }
  }

  private _resetGame(shuffle?: boolean) {
    this._initializeDeck(shuffle ?? true);
    this._players.push(...this._newPlayers);
    this._newPlayers.forEach(id => {
      this._playerPoints.set(id, 100);
    });
    this._newPlayers = [];
    this._players.forEach(id => {
      this._hands.set(id, [[]]);
      this._currentHandIndex.set(id, 0);
      this._playerBets.set(id, []); // To be updated later
      this._handsAwaitingBet.set(id, 0);
      this._results.set(id, []);
      if ((this._playerPoints.get(id) as number) <= 0) {
        this._playerPoints.set(id, 100);
      }
    });

    if (this._deck.length < this._numDecks * 52 * this.SHUFFLELIMIT) {
      this._initializeDeck(this._shouldShuffle);
    }
    this._gameInProgress = true;
    this._playerMoveIndex = -1;

    this._dealerHand = [];
  }

  /**
   * Adds this player to the queue to join the game next round
   * @param playerID Player ID to be joining
   */
  public addPlayer(playerID: string) {
    if (this._players.includes(playerID) || this._newPlayers.includes(playerID)) {
      throw new Error('Player has already been added to this game!');
    }
    if (this._players.length + this._newPlayers.length >= this.PLAYERLIMIT) {
      throw new Error('Game has maximum number of players');
    }
    this._newPlayers.push(playerID);
  }

  /**
   * Performs a player move in this game.
   * @param playerID The ID of the player making a move
   * @param move the Blackjack move the player chooses
   */
  public playerMove(playerID: string, move: BlackjackMove): void {
    const isWager = (move as string).substring(0, 6) === 'Wager:';
    if (
      !isWager &&
      playerID !== this._players[this._playerMoveIndex] &&
      move !== 'Leave' &&
      move !== 'Join'
    ) {
      throw new Error('Wrong player moving!');
    }
    let turnOver = false;
    let currentHandIndex = this._currentHandIndex.get(playerID) as number;
    const playerHands = this._hands.get(playerID) as Card[][];
    switch (move) {
      case BlackjackMove.Hit: {
        const nextCard = this._deck.pop() as Card;
        playerHands[currentHandIndex].push(nextCard);
        const currentVal = this._handValues(playerID)[currentHandIndex];
        if (currentVal >= 21) {
          currentHandIndex += 1;
          this._currentHandIndex.set(playerID, currentHandIndex);
          turnOver = currentHandIndex === this._hands.get(playerID)?.length;
        }
        break;
      }
      case BlackjackMove.Double: {
        const currentHand = playerHands[currentHandIndex];
        const currentHandVal = this._handValues(playerID)[currentHandIndex];
        if (currentHandVal > 11 || currentHandVal < 9) {
          throw new Error('Hand value must be between 9 and 11!');
        }
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
        const secondHand = [initHand[1]];
        playerHands[currentHandIndex].splice(1, 1);
        playerHands.push(secondHand);
        const bets = this._playerBets.get(playerID) as number[];
        bets.push(bets[0]);
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
        if (
          (this._players.length === 1 && this._newPlayers.length === 0) ||
          (this._players.length === 0 && this._newPlayers.length === 1)
        ) {
          this._players = [];
          this._playerMoveIndex = -1;
          this._hands = new Map<string, Card[][]>();
          this._currentHandIndex = new Map<string, number>();
          this._playerBets = new Map<string, number[]>();
          this._handsAwaitingBet = new Map<string, number | undefined>();
          this._playerPoints = new Map<string, number>();
          this._newPlayers = [];
          this._shouldShuffle = true;
          this._results = new Map<string, string[]>();
          this._gameInProgress = false;
        } else if (this._newPlayers.find(id => id === playerID)) {
          this._newPlayers = this._newPlayers.filter(id => id !== playerID);
        } else if (this._players.length === 1 && this._newPlayers.length > 0) {
          this._removePlayer(playerID);
          this.dealerAction(DealerMove.EndGame);
        } else if (this._players[this._playerMoveIndex] === playerID) {
          this.playerMove(playerID, BlackjackMove.Stay);
          this._removePlayer(playerID);
          this._playerMoveIndex -= 1;
        } else if (this._playerMoveIndex > this._players.indexOf(playerID)) {
          this._removePlayer(playerID);
          this._playerMoveIndex -= 1;
        } else if (
          Array.from(this._handsAwaitingBet.values()).filter(bet => bet === 0).length === 1 &&
          this._handsAwaitingBet.get(playerID) === 0
        ) {
          this._removePlayer(playerID);
          this._deal();
          this._playerMoveIndex = 0;
          if (this._handValues(this._players[0])[0] === 21) {
            this.playerMove(this._players[0], BlackjackMove.Stay);
          }
        } else {
          this._removePlayer(playerID);
        }
        break;
      }
      case BlackjackMove.Join: {
        break;
      }
      default:
        if (isWager) {
          const wagerValue = +(move as string).slice(6);
          this._setBet(playerID, wagerValue);
          const nonBetters = this._players.find(id => this._handsAwaitingBet.get(id) !== undefined);
          if (!nonBetters) {
            this._deal();
            this._playerMoveIndex = 0;
            if (this._handValues(this._players[0])[0] === 21) {
              this.playerMove(this._players[0], BlackjackMove.Stay);
            }
          }
        } else {
          throw new Error('Unknown Blackjack move');
        }
    }

    if (move !== 'Leave') {
      this._playerMoveIndex += turnOver ? 1 : 0;
      if (turnOver && this._playerMoveIndex < this._players.length) {
        if (this._handValues(this._players[this._playerMoveIndex])[0] === 21) {
          this.playerMove(this._players[this._playerMoveIndex], BlackjackMove.Stay);
        }
      }

      if (
        this._playerMoveIndex >= this._players.length &&
        this._results.get(this._players[0])?.length === 0
      ) {
        this._playDealerHand();
      }
    }
  }

  private _removePlayer(playerID: string): void {
    const newPlayers = this._players.filter(id => id !== playerID);
    const newQueue = this._newPlayers.filter(id => id !== playerID);
    this._players = newPlayers;
    this._newPlayers = newQueue;
    this._hands.delete(playerID);
    this._currentHandIndex.delete(playerID);
    this._handsAwaitingBet.delete(playerID);
    this._playerBets.delete(playerID);
    this._playerPoints.delete(playerID);
    this._results.delete(playerID);
  }

  /**
   * Performs a dealer move in this game.
   * @param move the Blackjack move that the dealer is making
   */
  public dealerAction(move: DealerMove) {
    switch (move) {
      case DealerMove.StartGame: {
        this._resetGame(this._shouldShuffle);
        break;
      }
      case DealerMove.EndGame: {
        this._players.forEach(playerID => {
          this._hands.delete(playerID);
          this._currentHandIndex.delete(playerID);
          this._handsAwaitingBet.delete(playerID);
          this._playerBets.delete(playerID);
        });
        this._resetGame(this._shouldShuffle);
        break;
      }
      case DealerMove.PlayHand: {
        this._playDealerHand();
        break;
      }
      default:
        throw new Error('Unknown dealer action!');
    }
  }

  private _getPlayerHands(playerID: string): Card[][] {
    if (!this._players.includes(playerID)) {
      throw new Error(`${playerID} does not exist in this game`);
    }
    return this._hands.get(playerID) as Card[][];
  }

  private _playDealerHand(): void {
    if (this._playerMoveIndex < this._players.length) {
      throw new Error('Not the dealers turn!');
    }
    this.dealerHand[1].isFaceUp = true;
    let val = +this._handValues('dealer').slice(-2);
    while (val < 17) {
      const nextCard = this._deck.pop() as Card;
      this._dealerHand.push(nextCard);
      val = +this._handValues('dealer');
    }
    this._handleBets();
  }

  private _handValues(playerID: string): number[] {
    let hands: Card[][];
    const totals: number[] = [];
    if (playerID === 'dealer') {
      hands = [this._dealerHand];
    } else {
      hands = this._getPlayerHands(playerID);
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

  private _setBet(playerID: string, bet: number): void {
    const awaitingBet = this._handsAwaitingBet.get(playerID);
    if (this._handsAwaitingBet.get(playerID) === undefined) {
      throw new Error('Player is not awaiting a bet!');
    }
    if (bet < 0) {
      throw new Error('Bet must be positive!');
    }
    this._handsAwaitingBet.set(playerID, undefined);
    const currentBets = this._playerBets.get(playerID) as number[];
    currentBets[awaitingBet as number] = bet;
    this._playerBets.set(playerID, currentBets);
  }

  // Once the game is over, distributes the points accordingly
  // Currently doesn't do anything with the dealer's points
  private _handleBets(): void {
    const dealerHandVal = this._handValues('dealer')[0];
    this._players.forEach(id => {
      const handVals = this._handValues(id);
      const bets = this._playerBets.get(id) as number[];
      let points = this._playerPoints.get(id) as number;
      const results: string[] = [];
      handVals.forEach((val, index) => {
        if (
          val === 21 &&
          (this.hands.get(id) as Card[][])[index].length === 2 &&
          dealerHandVal !== 21
        ) {
          results.push('won');
          bets[index] *= 1.5;
          points += bets[index];
        } else if (val > 21 || (val < dealerHandVal && dealerHandVal <= 21)) {
          points -= bets[index];
          results.push('lost');
        } else if (val > dealerHandVal || dealerHandVal > 21) {
          points += bets[index];
          results.push('won');
        } else {
          results.push('pushed');
        }
      });
      this._results.set(id, results);
      this._playerPoints.set(id, points);
    });
  }

  /**
   * Converts this Blackjack Game instance to a simple BlackjackGameModel suitable for
   * transporting over a socket to a client.
   * @returns
   */
  public toModel() {
    const game = {
      hands: Array.from(this.hands.values()),
      playerPoints: Array.from(this._playerPoints.values()),
      playerBets: Array.from(this.playerBets.values()),
      playerMoveID: this._playerMoveIndex === -1 ? '' : this._players[this._playerMoveIndex],
      players: this._players,
      queue: this._newPlayers,
      isStarted: this._gameInProgress,
      dealerHand: this._dealerHand,
      results: Array.from(this._results.values()),
    };
    return game;
  }
}
