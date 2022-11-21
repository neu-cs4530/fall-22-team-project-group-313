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
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useBlackjackAreaOccupants } from '../../../classes/BlackjackAreaController';
import { useBlackjackAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
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
  const [sliderValue, setSliderValue] = React.useState(5);
  const [testText, setTestText] = useState<number>(0);

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

  const toast = useToast();

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
  const Card = (props: { suit: string; value: string }) => {
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

  function printCard(value: string, suit: string) {
    return <Card suit={suit} value={value} />;
  }

  function playerRow(player: string, cards: { value: string; suit: string }[], row: number) {
    let totalValue = 0;

    for (const card of cards) {
      const val = +card.value;
      totalValue += val;
    }
    return (
      <GridItem colStart={1} rowStart={row} rowSpan={7} colSpan={1}>
        <HStack spacing={10}>
          <Text> {player} </Text>
          {cards.map(card => {
            return printCard(card.value, card.suit);
          })}
          <Text> {totalValue} </Text>
        </HStack>
      </GridItem>
    );
  }

  function dealer(cards: { value: string; suit: string }[]) {
    let totalValue = 0;

    for (const card of cards) {
      const val = +card.value;
      totalValue += val;
    }
    return (
      <GridItem colStart={7} rowStart={9} rowSpan={2} colSpan={1}>
        <HStack spacing={10}>
          <Text> Dealer </Text>
          {cards.map(card => {
            return printCard(card.value, card.suit);
          })}
          <Text> {totalValue} </Text>
        </HStack>
      </GridItem>
    );
  }

  function allHands(players: string[], hands: { value: string; suit: string }[][]) {
    return (
      <Grid h='200px' templateRows='repeat(25, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
        {players.map((player: string) => {
          {
            return playerRow(
              player,
              hands[players.indexOf(player)],
              players.indexOf(player) * 4 + 2,
            );
          }
        })}
        {dealer([
          { value: '9', suit: 'clubs' },
          { value: '5', suit: 'clubs' },
          { value: '7', suit: 'clubs' },
        ])}
      </Grid>
    );
  }

  function outputWager(minPoints: number, maxPoints: number) {
    return (
      <HStack>
        <Text>Wager:</Text>
        <NumberInput defaultValue={minPoints} min={minPoints} max={maxPoints}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button>Submit</Button>
      </HStack>
    );
  }

  function wager(points: number) {
    if (points <= 25) return outputWager(1, points);
    else return outputWager(Math.trunc(points * 0.05), Math.trunc(points * 0.25));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        const occupants = blackjackAreaController.occupants;
        blackjackAreaController.occupants = occupants.filter(
          player => player.id !== coveyTownController.ourPlayer.id,
        );
        coveyTownController.emitBlackjackAreaUpdate(blackjackAreaController);
        coveyTownController.unPause();
        console.log(blackjackAreaController);
        console.log(coveyTownController);
      }}
      size='full'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>BlackJackArea </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {allHands(
            useBlackjackAreaOccupants(blackjackAreaController).map(player => {
              return player.userName;
            }),
            // ['1', '2', '3', '4', '5'],
            // [[], [], [], [], []],
            [
              [
                { value: '7', suit: 'diamond' },
                { value: '9', suit: 'heart' },
              ],
              [
                { value: '10', suit: 'diamond' },
                { value: '3', suit: 'heart' },
              ],
              // [
              //   { value: '4', suit: 'clubs' },
              //   { value: '8', suit: 'clubs' },
              //   { value: '6', suit: 'spade' },
              // ],
              // [
              //   { value: '4', suit: 'clubs' },
              //   { value: '8', suit: 'clubs' },
              //   { value: '6', suit: 'spade' },
              // ],
              // [
              //   { value: '4', suit: 'clubs' },
              //   { value: '8', suit: 'clubs' },
              //   { value: '6', suit: 'spade' },
              // ],
            ],
          )}
        </ModalBody>
        <ModalFooter justifyContent={'space-between'}>
          <Text className='pull-left'>{coveyTownController.ourPlayer.userName}</Text>
          {wager(25)}
          <HStack spacing={8}>
            <Button>
              {/* // onClick={() => {
              //   ;
              // }}> */}
              Hit
            </Button>
            <Button>Stay</Button>
            <Button>Split</Button>
            <Button>Double</Button>
            <Button>Surrender</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
