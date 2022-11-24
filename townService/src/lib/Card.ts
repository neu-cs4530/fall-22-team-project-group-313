export enum Suit {
  S = 'spades',
  H = 'hearts',
  D = 'diamonds',
  C = 'clubs',
}

// export enum Rank {
//   Ace = 1,
//   Two = 2,
//   Three = 3,
//   Four = 4,
//   Five = 5,
//   Six = 6,
//   Seven = 7,
//   Eight = 8,
//   Nine = 9,
//   Ten = 10,
//   Jack = 11,
//   Queen = 13,
//   King = 14
// }

export default class Card {
  public readonly suit: Suit;

  public readonly rank: string;

  public isFaceUp: boolean;

  private _rankToValue = new Map<string, number>();

  public toString(): string {
    return this.suit + this.rank;
  }

  private constructor(suit: Suit, rank: string) {
    this.suit = suit;
    this.rank = rank;
    this.isFaceUp = true;
    this._rankToValue.set('A', 11);
    this._rankToValue.set('2', 2);
    this._rankToValue.set('3', 3);
    this._rankToValue.set('4', 4);
    this._rankToValue.set('5', 5);
    this._rankToValue.set('6', 6);
    this._rankToValue.set('7', 7);
    this._rankToValue.set('8', 8);
    this._rankToValue.set('9', 9);
    this._rankToValue.set('10', 10);
    this._rankToValue.set('J', 10);
    this._rankToValue.set('Q', 10);
    this._rankToValue.set('K', 10);
  }

  public get value() {
    return this._rankToValue.get(this.rank) as number;
  }

  public static getDeck(): Card[] {
    const deck = new Array<Card>();
    const card = new Card(Suit.C, 'A');
    const ranks = Array.from(card._rankToValue.keys());
    ranks.forEach(rank => {
      Object.values(Suit).forEach(suit => {
        deck.push(new Card(suit as Suit, rank));
      });
    });
    return deck;
  }
}
