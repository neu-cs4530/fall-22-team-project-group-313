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
import _, { indexOf } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useBlackjackAreaOccupants, useGame } from '../../../classes/BlackjackAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useBlackjackAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { GameAction, Card } from '../../../types/CoveyTownSocket';
import BlackjackArea from './BlackjackArea';

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

  useEffect(() => {
    if (blackjackAreaController.gameAction?.GameAction === 'EndGame') {
      setWagerHide(false);
    }
  }, [blackjackAreaController.gameAction]);

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

  // const toast = useToast();

  //   const createBlackjackArea = useCallback(async () => {
  //     if (video && viewingAreaController) {
  //       const request: ViewingAreaModel = {
  //         id: viewingAreaController.id,
  //         video,
  //         isPlaying: true,
  //         elapsedTimeSec: 0,
  //       };
  //       try {
  //         await coveyTownController.createViewingArea(request);
  //         toast({
  //           title: 'Video set!',
  //           status: 'success',
  //         });
  //         coveyTownController.unPause();
  //       } catch (err) {
  //         if (err instanceof Error) {
  //           toast({
  //             title: 'Unable to set video URL',
  //             description: err.toString(),
  //             status: 'error',
  //           });
  //         } else {
  //           console.trace(err);
  //           toast({
  //             title: 'Unexpected Error',
  //             status: 'error',
  //           });
  //         }
  //       }
  //     }
  //   }, [video, coveyTownController, viewingAreaController, toast]);

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
          {/* <Text> {totalValue} </Text> */}
        </HStack>
      </GridItem>
    );
  }

  function dealer(cards: Card[]) {
    const faceUpCards = cards.filter(card => card.isFaceUp);
    const faceDownCards = cards.filter(card => !card.isFaceUp);
    return (
      <GridItem colStart={7} rowStart={9} rowSpan={2} colSpan={1}>
        <HStack spacing={10}>
          <Text> Dealer </Text>
          {faceUpCards.map(card => {
            return printCard(card.rank, card.suit);
          })}
          {faceDownCards.map(() => {
            return printCard('', '');
          })}
          {/* <Text> {totalValue} </Text> */}
        </HStack>
      </GridItem>
    );
  }

  function allHands(players: string[], hands: Card[][][]) {
    return (
      <Grid h='200px' templateRows='repeat(25, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
        {players.map((player: string) => {
          {
            return playerRow(
              player,
              hands.length === 0 ? [] : hands[players.indexOf(player)][0],
              players.indexOf(player) * 4 + 2,
            );
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
          defaultValue={minPoints}
          min={minPoints}
          max={maxPoints}
          value={wagerValue}
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
        <ModalCloseButton />
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
        <ModalFooter hidden={!game.isStarted} justifyContent={'space-between'}>
          <Text className='pull-left'>
            Bank: {game.playerPoints[game.players.indexOf(coveyTownController.ourPlayer.id)]} points
          </Text>
          <HStack hidden={game.results.length == 0}>
            <Text>
              You {game.results[game.players.indexOf(coveyTownController.ourPlayer.id)]}{' '}
              {game.playerBets[game.players.indexOf(coveyTownController.ourPlayer.id)]} points
            </Text>
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
                  `Hit`,
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
                  `Stay`,
                );
                coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
              }}>
              Stay
            </Button>
            <Button>Split</Button>
            <Button>Double</Button>
            <Button>Surrender</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
