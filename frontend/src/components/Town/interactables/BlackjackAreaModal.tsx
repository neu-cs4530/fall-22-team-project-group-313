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
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
// import { useBlackjackAreaOccupants } from '../../../classes/BlackjackAreaController';
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

    switch (props.suit) {
      case 'clubs':
        suitConversion = '♣︎';
        break;
      case 'heart':
        suitConversion = '♥︎';
        break;
      case 'diamond':
        suitConversion = '♦︎';
        break;
      case 'spade':
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
    return (
      <GridItem colStart={1} rowStart={row} rowSpan={7} colSpan={1}>
        <HStack spacing={10}>
          <Text> Player{player} </Text>
          {cards.map(card => {
            return printCard(card.value, card.suit);
          })}
        </HStack>
      </GridItem>
    );
  }

  function dealer(cards: { value: string; suit: string }[]) {
    return (
      <GridItem colStart={9} rowStart={4} rowSpan={1} colSpan={1}>
        <HStack spacing={10}>
          <Text> Dealer </Text>
          {cards.map(card => {
            return printCard(card.value, card.suit);
          })}
        </HStack>
      </GridItem>
    );
  }

  function allHands(players: string[], hands: { value: string; suit: string }[][]) {
    return (
      <Grid h='200px' templateRows='repeat(6, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
        {players.map((player: string) => {
          {
            return playerRow(player, hands[players.indexOf(player)], players.indexOf(player) + 2);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size='6xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>BlackJackArea </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {allHands(
            // useBlackjackAreaOccupants(blackjackAreaController).map(player => {
            //   return player.id;
            // }),
            ['1', '2', '3'],
            // [],
            [
              [
                { value: 'Q', suit: 'diamond' },
                { value: 'A', suit: 'heart' },
                { value: '2', suit: 'spade' },
              ],
              [
                { value: '10', suit: 'diamond' },
                { value: '3', suit: 'heart' },
                { value: '4', suit: 'diamond' },
              ],
              [
                { value: '4', suit: 'clubs' },
                { value: '8', suit: 'clubs' },
                { value: '6', suit: 'spade' },
              ],
            ],
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={8}>
            <Button
              onClick={() => {
                return setTestText(testText + 1);
              }}>
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
