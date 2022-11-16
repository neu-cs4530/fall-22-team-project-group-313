export enum Suit {
  S = 'S',
  H = 'H',
  D = 'D',
  C = 'C',
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
    this._rankToValue.set('Ace', 11);
    this._rankToValue.set('Two', 2);
    this._rankToValue.set('Three', 3);
    this._rankToValue.set('Four', 4);
    this._rankToValue.set('Five', 5);
    this._rankToValue.set('Six', 6);
    this._rankToValue.set('Seven', 7);
    this._rankToValue.set('Eight', 8);
    this._rankToValue.set('Nine', 9);
    this._rankToValue.set('Ten', 10);
    this._rankToValue.set('Jack', 10);
    this._rankToValue.set('Queen', 10);
    this._rankToValue.set('King', 10);
  }

  public get value() {
    return this._rankToValue.get(this.rank) as number;
  }

  public static getDeck(): Card[] {
    const deck = new Array<Card>();
    const card = new Card(Suit.C, 'Ace');
    const ranks = Array.from(card._rankToValue.keys());
    ranks.forEach(rank => {
      Object.keys(Suit).forEach(suit => {
        deck.push(new Card(suit as Suit, rank));
      });
    });
    return deck;
  }
}
