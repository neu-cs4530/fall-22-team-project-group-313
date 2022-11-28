import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SlideFade,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useGame } from '../../../classes/BlackjackAreaController';
import { useBlackjackAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { Card, GameAction } from '../../../types/CoveyTownSocket';
import BlackjackArea from './BlackjackArea';
// import "@fontsource/croissant-one"

function cardValue(card: Card) {
  switch (card.rank) {
    case 'A':
      return 11;
    case '2':
      return 2;
    case '3':
      return 3;
    case '4':
      return 4;
    case '5':
      return 5;
    case '6':
      return 6;
    case '7':
      return 7;
    case '8':
      return 8;
    case '9':
      return 9;
    case '10':
      return 10;
    case 'J':
      return 10;
    case 'Q':
      return 10;
    case 'K':
      return 10;
    default:
      throw new Error('Unexpected Card Rank');
  }
}

function handValue(hand: Card[]): number {
  let total = 0;
  let aceCount = 0;
  hand.forEach(card => {
    total += cardValue(card);
    if (cardValue(card) === 11) {
      aceCount += 1;
    }
  });
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }
  return total;
}

export default function BlackjackAreaModal({
  isOpen,
  close,
  blackjackArea,
}: {
  isOpen: boolean;
  close: () => void;
  blackjackArea: BlackjackArea;
}): JSX.Element {
  const coveyTownController = useTownController();
  const blackjackAreaController = useBlackjackAreaController(blackjackArea?.name);
  const game = useGame(blackjackAreaController);
  const [wagerValue, setWagerValue] = useState(5);
  const [wagerHide, setWagerHide] = useState(false);
  const [cannotSplit, setCannotSplit] = useState(true);
  const [cannotDouble, setCannotDouble] = useState(true);

  const playerInGame = useCallback(
    (playerId: string) => {
      return game.players.find(id => id === playerId);
    },
    [game.players],
  );

  useEffect(() => {
    if (
      blackjackAreaController.gameAction?.GameAction === 'EndGame' &&
      playerInGame(coveyTownController.ourPlayer.id)
    ) {
      setWagerHide(false);
      if (game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)] <= 25) {
        if (
          wagerValue > game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)]
        ) {
          setWagerValue(game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)]);
        }
      } else if (
        wagerValue >
        Math.trunc(game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)] * 0.25)
      ) {
        setWagerValue(
          Math.trunc(
            game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)] * 0.25,
          ),
        );
      } else if (
        wagerValue <
        Math.trunc(game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)] * 0.05)
      ) {
        setWagerValue(
          Math.trunc(
            game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)] * 0.25,
          ),
        );
      }
    }
  }, [
    blackjackAreaController.gameAction,
    coveyTownController.ourPlayer.id,
    game.playerPoints,
    game.players,
    playerInGame,
    wagerValue,
  ]);

  useEffect(() => {
    setCannotDouble(true);
    setCannotSplit(true);
    if (game.isStarted && playerInGame(coveyTownController.ourPlayer.id)) {
      // Your player must have only one hand
      if (game.hands[game.players.indexOf(coveyTownController.ourPlayer.id)].length == 1) {
        // You must have two cards exactly
        if (game.hands[game.players.indexOf(coveyTownController.ourPlayer.id)][0].length == 2) {
          if (
            // Bank value must allow it
            game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][
              game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)].length - 1
            ] *
              2 <=
            game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)]
          ) {
            // Your two cards must have the same value to split
            if (
              cardValue(
                game.hands[game.players.indexOf(coveyTownController.ourPlayer.id)][0][0],
              ) ===
              cardValue(game.hands[game.players.indexOf(coveyTownController.ourPlayer.id)][0][1])
            ) {
              setCannotSplit(false);
            }
            // Your hand value must be between 9-11 to double
            if (
              handValue(game.hands[game.players.indexOf(coveyTownController.ourPlayer.id)][0]) >=
                9 &&
              handValue(game.hands[game.players.indexOf(coveyTownController.ourPlayer.id)][0]) <= 11
            ) {
              setCannotDouble(false);
            }
          }
        }
      }
    }
  }, [
    blackjackAreaController.gameAction,
    coveyTownController.ourPlayer.id,
    game.hands,
    game.isStarted,
    game.playerBets,
    game.playerPoints,
    game.players,
    playerInGame,
  ]);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  function createCard(suit: string, value: string) {
    let suitConversion;

    switch (suit) {
      case 'C':
        suitConversion = '♣︎';
        break;
      case 'H':
        suitConversion = '♥︎';
        break;
      case 'D':
        suitConversion = '♦︎';
        break;
      case 'S':
        suitConversion = '♠︎';
        break;
      default:
    }

    if (suitConversion == '♣︎' || suitConversion == '♠︎') {
      return (
        <div className='card card-black'>
          <div className='card-tl'>
            <div className='card-value'>{value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
          <div className='card-br'>
            <div className='card-value'>{value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className='card card-red'>
          <div className='card-tl'>
            <div className='card-value'>{value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
          <div className='card-br'>
            <div className='card-value'>{value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
        </div>
      );
    }
  }

  function updateGameModel(index: number, player: string, action: string) {
    const a: GameAction = {
      index: index,
      GameAction: action,
      playerID: player,
    };
    blackjackAreaController.gameAction = a;
  }

  function printCard(value: string, suit: string) {
    return (
      <SlideFade in={isOpen} offsetX={'100px'}>
        {createCard(suit, value)}
      </SlideFade>
    );
  }

  function playerRow(player: string, cards: Card[], row: number) {
    let nameColor = 'black';
    if (coveyTownController.ourPlayer.id === player) {
      nameColor = '#d4af37';
    }

    let yourTurn = false;
    if (game.playerMoveID === player) {
      yourTurn = true;
    }
    return (
      <GridItem colStart={1} rowStart={row} rowSpan={7} colSpan={1}>
        <HStack spacing={10} fontFamily={'Sans Serif'} fontSize={'30px'}>
          <Text color={nameColor}>
            {'   '}
            {coveyTownController.players.find(occupant => occupant.id === player)?.userName}
          </Text>
          <HStack spacing={0}>
            {cards.map(card => {
              return printCard(card.rank, card.suit);
            })}
          </HStack>
          <Tooltip label='Total Hand Value'>
            <Text> {handValue(cards)} </Text>
          </Tooltip>
          <Tooltip label='Waiting for this player'>
            <Text hidden={!yourTurn} color={'#d10f22'} fontSize={'75px'}>
              ←
            </Text>
          </Tooltip>
        </HStack>
      </GridItem>
    );
  }

  function playerRowSplit(player: string, hands: Card[][], row: number) {
    const handOne = hands[0];
    const handTwo = hands[1];

    let yourTurn = false;
    if (game.playerMoveID === player) {
      yourTurn = true;
    }
    return (
      <GridItem colStart={1} rowStart={row} rowSpan={7} colSpan={1}>
        <HStack spacing={10} fontFamily={'Sans Serif'} fontSize={'30px'}>
          <Text>
            {coveyTownController.players.find(occupant => occupant.id === player)?.userName}
          </Text>
          <HStack spacing={0}>
            {handOne.map(card => {
              return printCard(card.rank, card.suit);
            })}
          </HStack>
          <Text> {handValue(handOne)} </Text>
          <HStack spacing={0}>
            {handTwo.map(card => {
              return printCard(card.rank, card.suit);
            })}
          </HStack>
          <Text> {handValue(handTwo)} </Text>
          <Text hidden={!yourTurn} color={'#d10f22'} fontSize={'75px'}>
            ←
          </Text>
        </HStack>
      </GridItem>
    );
  }

  function dealer(cards: Card[]) {
    const faceUpCards = cards.filter(card => card.isFaceUp);
    const faceDownCards = cards.filter(card => !card.isFaceUp);
    return (
      <GridItem colStart={5} rowStart={12} rowSpan={2} colSpan={1}>
        <HStack spacing={10} fontFamily={'Sans Serif'} fontSize={'30px'}>
          <Text> Dealer </Text>
          <HStack spacing={0}>
            {faceUpCards.map(card => {
              return printCard(card.rank, card.suit);
            })}
            {faceDownCards.map(() => {
              return printCard('', '');
            })}
          </HStack>
          <Tooltip label='Total Hand Value'>
            <Text> {handValue(faceUpCards)} </Text>
          </Tooltip>
        </HStack>
      </GridItem>
    );
  }

  function allHands(players: string[], hands: Card[][][]) {
    return (
      <Grid h='200px' templateRows='repeat(31, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
        {players.map((player: string) => {
          {
            if (hands[players.indexOf(player)].length == 2) {
              return playerRowSplit(
                player,
                hands[players.indexOf(player)],
                players.indexOf(player) * 6 + 2,
              );
            } else {
              return playerRow(
                player,
                hands.length === 0 ? [] : hands[players.indexOf(player)][0],
                players.indexOf(player) * 6 + 2,
              );
            }
          }
        })}
        {dealer(game.dealerHand)}
        <GridItem colStart={5} rowStart={33} rowSpan={2} colSpan={10}></GridItem>
      </Grid>
    );
  }

  function outputWager(minPoints: number, maxPoints: number) {
    return (
      <HStack>
        <Text hidden={!wagerHide} className={'text-style'} color={'#d4af37'} fontSize={'40px'}>
          Current Wager: {wagerValue} points
        </Text>
        <Tooltip label='Use the slider to select the amount you would like to wager and then press Submit. Note: Wagers are kept within the range of 5% - 25% of the bank. If your bank equals 25 points or less, then you can wager any amount between 0 and the max.'>
          <Text
            hidden={wagerHide}
            className='pull-left text-style'
            color={'#d4af37'}
            fontSize={'40px'}>
            Wager:
          </Text>
        </Tooltip>
        <Slider
          width='400px'
          hidden={wagerHide}
          focusThumbOnChange={false}
          min={minPoints}
          max={maxPoints}
          defaultValue={wagerValue}
          onChange={(value: number) => setWagerValue(value)}>
          <SliderTrack color={'#d4af37'}>
            <SliderFilledTrack background={'#d4af37'} />
          </SliderTrack>
          <SliderThumb fontSize='sm' boxSize='30px' opacity='90%'>
            {wagerValue}
          </SliderThumb>
        </Slider>
        <Button
          hidden={wagerHide}
          onClick={() => {
            updateGameModel(
              blackjackAreaController.gameAction == undefined
                ? 0
                : blackjackAreaController.gameAction.index + 1,
              coveyTownController.ourPlayer.id,
              `Wager:${wagerValue}`,
            );
            setWagerHide(true);
            coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
          }}>
          Submit
        </Button>
      </HStack>
    );
  }

  function wager(points: number) {
    if (
      game.isStarted &&
      !(game.results.length !== 0 && playerInGame(coveyTownController.ourPlayer.id))
    ) {
      if (points <= 25) return outputWager(1, points);
      else return outputWager(Math.trunc(points * 0.05), Math.trunc(points * 0.25));
    }
  }

  function results() {
    if (game.results.length !== 0 && playerInGame(coveyTownController.ourPlayer.id)) {
      if (game.results[game.players.indexOf(coveyTownController.ourPlayer.id)].length == 2) {
        return (
          <Text className='text-style' color={'#d4af37'} fontSize={'20px'}>
            You {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)][0]}{' '}
            {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][0]} points and{' '}
            {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)][1]}{' '}
            {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][1]} points
          </Text>
        );
      } else {
        return (
          <Text className='text-style' color={'#d4af37'} fontSize={'20px'}>
            You {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)][0]}{' '}
            {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][0]} points
          </Text>
        );
      }
    }
  }

  function lobby(name: string) {
    return (
      <Text fontSize={'30px'} align={'center'} fontFamily={'Sans Serif'} color={'#d4af37'}>
        {name}
      </Text>
    );
  }

  function leaderboardText(name: string, points: number | undefined) {
    return (
      <Text fontSize={'30px'} align={'center'} fontFamily={'Sans Serif'} color={'#d4af37'}>
        {name.split(':', 1)}: {points} points
      </Text>
    );
  }

  function historicalLeaderboard() {
    const historicalLeaders = coveyTownController.blackjackHistoricalLeaders;

    const historicalLeadersSorted = new Map(
      [...historicalLeaders.entries()].sort((a, b) => b[1] - a[1]),
    );

    if (Array.from(historicalLeadersSorted.values()).length == 0) {
      return (
        <Text fontSize={'30px'} align={'center'} fontFamily={'Sans Serif'} color={'#d4af37'}>
          No historical leaders in this town
        </Text>
      );
    } else {
      return (
        <VStack spacing={'25px'}>
          {Array.from(historicalLeadersSorted.keys()).map(key => {
            {
              return leaderboardText(key, historicalLeadersSorted.get(key));
            }
          })}
        </VStack>
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        updateGameModel(
          blackjackAreaController.gameAction == undefined
            ? 0
            : blackjackAreaController.gameAction.index + 1,
          coveyTownController.ourPlayer.id,
          'Leave',
        );
        coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
        coveyTownController.unPause();
      }}
      size='full'>
      <ModalOverlay />
      <ModalContent backgroundColor={'#1d7349'} className={'button-style'}>
        <ModalHeader textAlign={'center'}>
          <Tooltip
            label='Basic Rules: Your goal in blackjack is to beat the dealer’s hand without going over 21. 
You’ll receive 2 cards at the beginning of each round, and you’ll add up the values of these cards. 
Cards 2-10 have face value; King, Queen, Jack are worth 10; and Aces are either a 1 or an 11 — it’s up to you to decide.
The dealer also draws two cards. The aim of the game is to beat his hand (have a higher hand) without going over 21.'>
            <Text className={'text-style'} color={'#d4af37'} fontSize={'85px'}>
              Blackjack Area
            </Text>
          </Tooltip>
        </ModalHeader>
        <ModalCloseButton hidden={game.isStarted && game.results.length === 0} />
        <ModalBody hidden={game.isStarted} pb={6}>
          <Flex marginTop={'60px'}>
            <Box flex='1'>
              <Text
                marginBottom={'30px'}
                align={'center'}
                fontSize={'45px'}
                fontWeight={'bold'}
                color={'#d4af37'}
                fontFamily={'Sans Serif'}>
                Players in this Lobby:
              </Text>
              <VStack spacing={'20px'}>
                {game.queue.map(id => {
                  return lobby(
                    coveyTownController.players.find(player => player.id === id)
                      ?.userName as string,
                  );
                })}
              </VStack>
            </Box>
            <Box flex='1'>
              <Text
                marginBottom={'30px'}
                align={'center'}
                fontSize={'45px'}
                fontWeight={'bold'}
                color={'#d4af37'}
                fontFamily={'Sans Serif'}>
                Historical Leaderboard:
              </Text>
              {historicalLeaderboard()}
            </Box>
          </Flex>
        </ModalBody>
        <Button
          width={'100%'}
          alignSelf='center'
          justifyContent='center'
          marginBottom={'60px'}
          hidden={game.isStarted}
          onClick={() => {
            updateGameModel(0, 'DEALER', 'StartGame');
            coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
          }}>
          Click to Start Game for all Players in this Lobby
        </Button>
        <ModalBody hidden={!game.isStarted} pb={6}>
          {allHands(game.players, game.hands)}
        </ModalBody>
        <ModalFooter
          hidden={!game.isStarted || !playerInGame(coveyTownController.ourPlayer.id)}
          justifyContent={'space-between'}>
          <Tooltip label='Total amount of points accrued/lost in the game. All players start at 100 points.'>
            <Text className='pull-left text-style' color={'#d4af37'} fontSize={'40px'}>
              Bank: {game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)]}{' '}
              points
            </Text>
          </Tooltip>
          <HStack hidden={game.results.length == 0}>
            {results()}
            <Button
              onClick={() => {
                updateGameModel(
                  blackjackAreaController.gameAction == undefined
                    ? 0
                    : blackjackAreaController.gameAction.index + 1,
                  'DEALER',
                  'EndGame',
                );
                coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
              }}>
              Click to start a new hand
            </Button>
          </HStack>
          {wager(game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)])}
          <HStack hidden={game.playerMoveID !== coveyTownController.ourPlayer.id} spacing={8}>
            <Tooltip label='Ask Dealer for another card'>
              <Button
                onClick={() => {
                  updateGameModel(
                    blackjackAreaController.gameAction == undefined
                      ? 0
                      : blackjackAreaController.gameAction.index + 1,
                    coveyTownController.ourPlayer.id,
                    'Hit',
                  );
                  coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
                }}>
                Hit
              </Button>
            </Tooltip>
            <Tooltip label='End your turn'>
              <Button
                onClick={() => {
                  updateGameModel(
                    blackjackAreaController.gameAction == undefined
                      ? 0
                      : blackjackAreaController.gameAction.index + 1,
                    coveyTownController.ourPlayer.id,
                    'Stay',
                  );
                  coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
                }}>
                Stay
              </Button>
            </Tooltip>
            <Tooltip label='Play 2 hands! Wager will be double if you choose this.'>
              <Button
                hidden={cannotSplit}
                onClick={() => {
                  updateGameModel(
                    blackjackAreaController.gameAction == undefined
                      ? 0
                      : blackjackAreaController.gameAction.index + 1,
                    coveyTownController.ourPlayer.id,
                    'Split',
                  );
                  setWagerValue(wagerValue * 2);
                  coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
                }}>
                Split
              </Button>
            </Tooltip>
            <Tooltip label='Hit once and double you wager'>
              <Button
                hidden={cannotDouble}
                onClick={() => {
                  updateGameModel(
                    blackjackAreaController.gameAction == undefined
                      ? 0
                      : blackjackAreaController.gameAction.index + 1,
                    coveyTownController.ourPlayer.id,
                    'Double',
                  );
                  setWagerValue(wagerValue * 2);
                  coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
                }}>
                Double
              </Button>
            </Tooltip>
          </HStack>
        </ModalFooter>
        <ModalFooter
          alignSelf={'center'}
          hidden={!game.isStarted || !!playerInGame(coveyTownController.ourPlayer.id)}
          color={'#d4af37'}
          fontSize={'40px'}
          className='text-style'>
          The hand is in progress. Please wait for the next hand to join the game.
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
