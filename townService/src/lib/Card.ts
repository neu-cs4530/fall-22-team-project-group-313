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

  static RankToValue = new Map<string, number>([
    ['A', 11],
    ['2', 2],
    ['3', 3],
    ['4', 4],
    ['5', 5],
    ['6', 6],
    ['7', 7],
    ['8', 8],
    ['9', 9],
    ['10', 10],
    ['J', 10],
    ['Q', 10],
    ['K', 10],
  ]);

  public toString(): string {
    return this.suit + this.rank;
  }

  constructor(suit: Suit, rank: string) {
    this.suit = suit;
    this.rank = rank;
    this.isFaceUp = true;
  }

  public get value() {
    return Card.RankToValue.get(this.rank) as number;
  }

  public static getDeck(): Card[] {
    const deck = new Array<Card>();
    const ranks = Array.from(Card.RankToValue.keys());
    ranks.forEach(rank => {
      Object.keys(Suit).forEach(suit => {
        deck.push(new Card(suit as Suit, rank));
      });
    });
    return deck;
  }
}
