import {
  Button,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useGame } from '../../../classes/BlackjackAreaController';
import { useBlackjackAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { Card, GameAction } from '../../../types/CoveyTownSocket';
import BlackjackArea from './BlackjackArea';

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

  function playerInGame(playerId: string) {
    return game.players.find(id => id === playerId);
  }

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

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const CreateCard = (props: { suit: string; value: string }) => {
    let suitConversion;
    let valueConversion;

    switch (props.suit) {
      case 'clubs':
        suitConversion = '♣︎';
        break;
      case 'hearts':
        suitConversion = '♥︎';
        break;
      case 'diamonds':
        suitConversion = '♦︎';
        break;
      case 'spades':
        suitConversion = '♠︎';
        break;
      default:
    }

    if (suitConversion == '♣︎' || suitConversion == '♠︎') {
      return (
        <div className='card card-black'>
          <div className='card-tl'>
            <div className='card-value'>{props.value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
          <div className='card-br'>
            <div className='card-value'>{props.value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className='card card-red'>
          <div className='card-tl'>
            <div className='card-value'>{props.value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
          <div className='card-br'>
            <div className='card-value'>{props.value}</div>
            <div className='card-suit'>{suitConversion}</div>
          </div>
        </div>
      );
    }
  };

  function updateGameModel(index: number, player: string, action: string) {
    const a: GameAction = {
      index: index,
      GameAction: action,
      playerID: player,
    };
    blackjackAreaController.gameAction = a;
  }

  function printCard(value: string, suit: string) {
    return <CreateCard suit={suit} value={value} />;
  }

  function playerRow(player: string, cards: Card[], row: number) {
    return (
      <GridItem colStart={1} rowStart={row} rowSpan={7} colSpan={1}>
        <HStack spacing={10}>
          <Text>
            {coveyTownController.players.find(occupant => occupant.id === player)?.userName}
          </Text>
          {cards.map(card => {
            return printCard(card.rank, card.suit);
          })}
          <Text> {handValue(cards)} </Text>
        </HStack>
      </GridItem>
    );
  }

  function playerRowSplit(player: string, hands: Card[][], row: number) {
    const handOne = hands[0];
    const handTwo = hands[1];
    return (
      <GridItem colStart={1} rowStart={row} rowSpan={7} colSpan={1}>
        <HStack spacing={10}>
          <Text>
            {coveyTownController.players.find(occupant => occupant.id === player)?.userName}
          </Text>
          {handOne.map(card => {
            return printCard(card.rank, card.suit);
          })}
          <Text> {handValue(handOne)} </Text>
          {handTwo.map(card => {
            return printCard(card.rank, card.suit);
          })}
          <Text> {handValue(handTwo)} </Text>
        </HStack>
      </GridItem>
    );
  }

  function dealer(cards: Card[]) {
    const faceUpCards = cards.filter(card => card.isFaceUp);
    const faceDownCards = cards.filter(card => !card.isFaceUp);
    return (
      <GridItem colStart={5} rowStart={9} rowSpan={2} colSpan={1}>
        <HStack spacing={10}>
          <Text> Dealer </Text>
          {faceUpCards.map(card => {
            return printCard(card.rank, card.suit);
          })}
          {faceDownCards.map(() => {
            return printCard('', '');
          })}
          <Text> {handValue(faceUpCards)} </Text>
        </HStack>
      </GridItem>
    );
  }

  function allHands(players: string[], hands: Card[][][]) {
    return (
      <Grid h='200px' templateRows='repeat(25, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
        {players.map((player: string) => {
          {
            if (hands[players.indexOf(player)].length == 2) {
              return playerRowSplit(
                player,
                hands[players.indexOf(player)],
                players.indexOf(player) * 4 + 2,
              );
            } else {
              return playerRow(
                player,
                hands.length === 0 ? [] : hands[players.indexOf(player)][0],
                players.indexOf(player) * 4 + 2,
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
        <Text hidden={!wagerHide}>Current Wager: {wagerValue}</Text>
        <Text hidden={wagerHide}>Wager:</Text>
        <NumberInput
          defaultValue={wagerValue}
          clampValueOnBlur={true}
          id='numInput'
          min={minPoints}
          max={maxPoints}
          hidden={wagerHide}
          onChange={(value: string) => setWagerValue(value as unknown as number)}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
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
    if (game.isStarted) {
      if (points <= 25) return outputWager(1, points);
      else return outputWager(Math.trunc(points * 0.05), Math.trunc(points * 0.25));
    }
  }

  function results() {
    if (game.results.length !== 0 && playerInGame(coveyTownController.ourPlayer.id)) {
      if (game.results[game.players.indexOf(coveyTownController.ourPlayer.id)].length == 2) {
        return (
          <Text>
            You {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)][0]}{' '}
            {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][0]} points and{' '}
            {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)][1]}{' '}
            {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][1]} points
          </Text>
        );
      } else {
        return (
          <Text>
            You {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)][0]}{' '}
            {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)][0]} points
          </Text>
        );
      }
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
      <ModalContent>
        <ModalHeader>BlackJackArea </ModalHeader>
        <ModalCloseButton hidden={game.isStarted && game.results.length === 0} />
        <Button
          hidden={game.isStarted}
          onClick={() => {
            updateGameModel(0, 'DEALER', 'StartGame');
            coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
          }}>
          Click to Start Game (ADD PLAYER NAMES TO LOBBY)
        </Button>
        <ModalBody hidden={!game.isStarted} pb={6}>
          {allHands(game.players, game.hands)}
        </ModalBody>
        <ModalFooter
          hidden={!game.isStarted || !playerInGame(coveyTownController.ourPlayer.id)}
          justifyContent={'space-between'}>
          <Text className='pull-left'>
            Bank: {game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)]} points
          </Text>
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
              Click this button to start a new hand!
            </Button>
          </HStack>
          {wager(game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)])}
          <HStack hidden={game.playerMoveID !== coveyTownController.ourPlayer.id} spacing={8}>
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
                coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
              }}>
              Split
            </Button>
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
                coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
              }}>
              Double
            </Button>
          </HStack>
        </ModalFooter>
        <ModalFooter hidden={!game.isStarted || !!playerInGame(coveyTownController.ourPlayer.id)}>
          The hand is already in progress. Please wait for the next hand to join the game.
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
