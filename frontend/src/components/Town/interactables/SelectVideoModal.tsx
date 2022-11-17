import { PlayingCard, Suit } from '@alehuo/react-playing-cards';
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
import { useViewingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { ViewingArea as ViewingAreaModel } from '../../../types/CoveyTownSocket';
import ViewingArea from './ViewingArea';

export default function SelectVideoModal({
  isOpen,
  close,
  viewingArea,
}: {
  isOpen: boolean;
  close: () => void;
  viewingArea: ViewingArea;
}): JSX.Element {
  const coveyTownController = useTownController();
  const viewingAreaController = useViewingAreaController(viewingArea?.name);
  const [testText, setTestText] = useState<number>(0);
  const [video, setVideo] = useState<string>(viewingArea?.defaultVideoURL || '');

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

  const createViewingArea = useCallback(async () => {
    if (video && viewingAreaController) {
      const request: ViewingAreaModel = {
        id: viewingAreaController.id,
        video,
        isPlaying: true,
        elapsedTimeSec: 0,
      };
      try {
        await coveyTownController.createViewingArea(request);
        toast({
          title: 'Video set!',
          status: 'success',
        });
        coveyTownController.unPause();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to set video URL',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [video, coveyTownController, viewingAreaController, toast]);

  function printCard(value: number, suit: string) {
    const style = { height: '1px', width: '1px' } as React.CSSProperties;
    return <PlayingCard value={value} suit={suit as Suit} style={style} />;
    // const text = value + suit;
    // return <Text> {text} </Text>;
  }

  function playerRow(player: number, cards: { value: number; suit: string }[], row: number) {
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

  function dealer(cards: { value: number; suit: string }[]) {
    return (
      <GridItem colStart={8} rowStart={4} rowSpan={1} colSpan={1}>
        <HStack spacing={10}>
          <Text> Dealer </Text>
          {cards.map(card => {
            return printCard(card.value, card.suit);
          })}
        </HStack>
      </GridItem>
    );
  }

  function allHands(players: number[], hands: { value: number; suit: string }[][]) {
    return (
      <Grid h='200px' templateRows='repeat(6, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
        {players.map((player: number) => {
          {
            return playerRow(player, hands[players.indexOf(player)], players.indexOf(player) + 2);
          }
        })}
        {dealer([
          { value: 9, suit: 'clubs' },
          { value: 5, suit: 'clubs' },
          { value: 7, suit: 'clubs' },
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
            [1],
            [
              [
                { value: 9, suit: 'clubs' },
                { value: 5, suit: 'clubs' },
                { value: 7, suit: 'clubs' },
              ],
              // [
              //   { value: 9, suit: 'hearts' },
              //   { value: 5, suit: 'hearts' },
              //   { value: 7, suit: 'hearts' },
              // ],
              // [
              //   { value: 9, suit: 'spades' },
              //   { value: 5, suit: 'spades' },
              //   { value: 7, suit: 'spades' },
              // ],
            ],
          )}
          {/* <Grid h='200px' templateRows='repeat(6, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
            {playerRow(
              1,
              [
                { value: 9, suit: 'clubs' },
                { value: 5, suit: 'clubs' },
                { value: 7, suit: 'clubs' },
              ],
              2,
            )}
            {playerRow(
              2,
              [
                { value: 9, suit: 'clubs' },
                { value: 5, suit: 'clubs' },
                { value: 7, suit: 'clubs' },
              ],
              3,
            )}
            <GridItem rowStart={4} colStart={8} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={4} colStart={9} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={4} colStart={10} rowSpan={1} colSpan={1} bg='tomato' />
          </Grid>  */}
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
