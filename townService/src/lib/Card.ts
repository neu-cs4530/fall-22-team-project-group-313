export enum Suit {
  S = 'S',
  H = 'H',
  D = 'D',
  C = 'C',
}

export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A',
}

export default class Card {
  public readonly suit: Suit;

  public readonly rank: Rank;

  public isFaceUp: boolean;

  public get value() {
    switch (this.rank) {
      case Rank.Ace:
        return 1;
      case Rank.Two:
        return 2;
      case Rank.Three:
        return 3;
      case Rank.Four:
        return 4;
      case Rank.Five:
        return 5;
      case Rank.Six:
        return 6;
      case Rank.Seven:
        return 7;
      case Rank.Eight:
        return 8;
      case Rank.Nine:
        return 9;
      default:
        return 10;
    }
  }

  constructor(suit: Suit, rank: Rank, isFaceUp?: boolean) {
    this.suit = suit;
    this.rank = rank;
    this.isFaceUp = isFaceUp ?? true;
  }

  public static getDeck(): Card[] {
    const deck = new Array<Card>();
    Object.keys(Suit).forEach(suit => {
      Object.keys(Rank).forEach(rank => {
        deck.push(new Card(suit as Suit, rank as Rank));
      });
    });
    return deck;
  }
}
