# Blackjack Game Rules

### The Pack
6 standard 52-card decks are shuffled together. The cards should be re-shuffled at random when dealing from the bottom half of the pack to simulate a dealer re-shuffling when reaching a randomly placed blank plastic card toward the bottom of the pack. 

### The Goal of the Game
Each participant attempts to beat the dealer by getting a count as close to 21 as possible, without going over 21.

### Card Values/Scoring
An ace is worth 11 when the total is less than or equal to 21 and 1 otherwise. Face cards are 10 and any other card is its pip value.

### Betting
Before the deal begins, each player places a bet. All new players will start with 100 points in their “bank”. They can place a minimum bet of 5% of their total bank value, a maximum bet of 25% of their bank value, or any dollar amount in between. These minimum and maximum restrictions no longer apply at bank values <= 25 points. If a player loses all of their money, they are reset at 100 points. 

### The Deal
When all the players have placed their bets, the dealer gives two cards face up to each player in rotation clockwise, and then one card face up and one card face down to themselves. Thus, each player except the dealer receives two cards face up, and the dealer receives one card face up and one card face down. 

### “Blackjack”
If a player's first two cards are an ace and a "ten-card" (a picture card or 10), giving a count of 21 in two cards, this is a "blackjack." If any player has a blackjack and the dealer does get 21, the dealer pays that player one and a half times the amount of their bet. If the dealer has a blackjack, they collect the bets of all players who do not have 21, (but no additional amount). If the dealer and another player both have blackjacks or a total of 21, the bet of that player is a “push” (a tie), and the player takes back their chips.

### The Play
The player at the top goes first and must decide whether to "stay" (not ask for another card) or "hit" (ask for another card in an attempt to get closer to a count of 21, or even hit 21 exactly). Thus, a player may stand on the two cards originally dealt to them, or they may ask the dealer for additional cards, one at a time, until deciding to stand on the total (if it is 21 or under), or goes "bust" (if it is over 21). In the latter case, the player loses and the dealer collects the bet wagered. The dealer then turns to the next player to the bottom and serves them in the same manner.

The combination of an ace with a card other than a ten-card is known as a "soft hand," because the player can count the ace as a 1 or 11, and either draw cards or not. For example with a "soft 17" (an ace and a 6), the total is 7 or 17. While a count of 17 is a good hand, the player may wish to draw for a higher total. If the draw creates a bust hand by counting the ace as an 11, the player simply counts the ace as a 1 and continues playing by standing or "hitting" (asking the dealer for additional cards, one at a time).

### The Dealer's Play
When the dealer has served every player, the dealer's face-down card is turned up. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand. If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21), the dealer must count the ace as 11 and stand. The dealer's decisions, then, are automatic on all plays, whereas the player always has the option of taking one or more cards.

### Splitting Pairs
If a player's first two cards are of the same value, such as two face cards or two sixes, they may choose to treat them as two separate hands when their turn comes around. The amount of the original bet then goes on one of the cards, and an equal amount must be placed as a bet on the other card. The player first plays the hand to their left by standing or hitting one or more times; only then is the hand to the right played. The two hands are thus treated separately, and the dealer settles with each on its own merits.

### Doubling Down
Another option open to the player is doubling their bet when the original two cards dealt total 9, 10, or 11. When the player's turn comes, they place a bet equal to the original bet, and the dealer gives the player just one card. With two fives, the player may split a pair, double down, or just play the hand in the regular way. Note that the dealer does not have the option of splitting or doubling down.

### Insurance
We are electing to not implement an insurance option. When the dealer’s face-up card is an ace, the dealer will automatically check hole card without any option to place side bets beforehand. Insurance is invariably not a good proposition for the player, unless they are quite sure that there are an unusually high number of ten-cards still left undealt; therefore, we will omit this option from our version of blackjack. 

### Settlement
A bet once paid and collected is never returned. Thus, one key advantage to the dealer is that the player goes first. If the player goes bust, they have already lost their wager, even if the dealer goes bust as well. If the dealer goes over 21, the dealer pays each player who has stood the amount of that player's bet. If the dealer stands at 21 or less, the dealer pays the bet of any player having a higher total (not exceeding 21) and collects the bet of any player having a lower total. If there is a stand-off (a player having the same total as the dealer), no chips are paid out or collected, this is called a push.

### Reshuffling
When each player's bet is settled, the dealer gathers in that player's cards and places them face up at the side not to be used again until coming to the bottom half of the pack then all cards are reshuffled back together. 

### Leaderboard
A “Leave” option will always be available to all players. The leaderboard will track and rank bank values by the highest points value reached at any point in the game, and all-time. 


**Source for rules:** https://bicyclecards.com/how-to-play/blackjack/
