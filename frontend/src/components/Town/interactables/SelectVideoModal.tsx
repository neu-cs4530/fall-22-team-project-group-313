<<<<<<< HEAD
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
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useViewingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { ViewingArea as ViewingAreaModel } from '../../../types/CoveyTownSocket';
// eslint-disable-next-line prettier/prettier
import ViewingArea from './ViewingArea';
// import { PlayingCard, Suit } from '@alehuo/react-playing-cards';

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

  // function card(value: number, suit: string) {
  //   const style = { maxHeight: 0, maxWidth: 0 } as React.CSSProperties;
  //   return <PlayingCard value={value} suit={suit as Suit} style={style} />;
  //   return value + ' ' + suit;
  // }

  function playerRow(player: number, cards: { value: number; suit: string }[]) {
    return (
      <HStack spacing={cards.length + 1}>
        Player {player}
        {cards.map(item => {
          // return card(item.value, item.suit);
          return item.value;
        })}
      </HStack>
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
          <Grid h='200px' templateRows='repeat(6, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
            <GridItem colStart={1} rowStart={2} rowSpan={7} colSpan={1}>
              {playerRow(1, [{ value: 10, suit: 'clubs' }])}
            </GridItem>
            {/* <GridItem rowStart={2} rowSpan={1} colSpan={1}>
              {card(10, 'clubs')}
            </GridItem>
            <GridItem colStart={1} rowStart={3} rowSpan={1} colSpan={1}>
              Player 2
            </GridItem>
            <GridItem rowStart={3} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem colStart={1} rowStart={4} rowSpan={1} colSpan={1}>
              Player 3
            </GridItem>
            <GridItem rowStart={4} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem colStart={1} rowStart={5} rowSpan={1} colSpan={1}>
              Player 4
            </GridItem>
            <GridItem rowStart={5} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem colStart={1} rowStart={6} rowSpan={1} colSpan={1}>
              Player 5
            </GridItem>
            <GridItem rowStart={6} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={3} colStart={9} rowSpan={1} colSpan={1}>
              Dealer = 17
            </GridItem> */}
            <GridItem rowStart={4} colStart={8} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={4} colStart={9} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={4} colStart={10} rowSpan={1} colSpan={1} bg='tomato' />
          </Grid>
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
=======
import {
  Button,
  Text,
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
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useViewingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { ViewingArea as ViewingAreaModel } from '../../../types/CoveyTownSocket';
// eslint-disable-next-line prettier/prettier
import ViewingArea from './ViewingArea';
import { PlayingCard, Suit } from '@alehuo/react-playing-cards';

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
    // const style = { height: '1px', width: '1px' } as React.CSSProperties;
    // return <PlayingCard value={value} suit={suit as Suit} style={style} />;
    const text = value + ' ' + suit;
    return <Text> {text} </Text>;
  }

  function playerRow(player: number, cards: { value: number; suit: string }[]) {
    return (
      <HStack spacing={cards.length + 10}>
        <Text> Player {player} </Text>
        {cards.map(item => {
          return printCard(item.value, item.suit);
          // return item.value;
        })}
      </HStack>
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
          <Grid h='200px' templateRows='repeat(6, 1fr)' templateColumns='repeat(10, 1fr)' gap={4}>
            <GridItem colStart={1} rowStart={2} rowSpan={7} colSpan={1} bg='tomato'>
              {playerRow(1, [
                { value: 9, suit: 'clubs' },
                { value: 5, suit: 'clubs' },
                { value: 7, suit: 'clubs' },
              ])}
            </GridItem>
            <GridItem colStart={1} rowStart={3} rowSpan={7} colSpan={1} bg='blue'>
              {playerRow(1, [
                { value: 9, suit: 'hearts' },
                { value: 5, suit: 'hearts' },
                { value: 7, suit: 'hearts' },
              ])}
            </GridItem>
            {/* <GridItem rowStart={2} rowSpan={1} colSpan={1}>
              {card(10, 'clubs')}
            </GridItem>
            <GridItem colStart={1} rowStart={3} rowSpan={1} colSpan={1}>
              Player 2
            </GridItem>
            <GridItem rowStart={3} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem colStart={1} rowStart={4} rowSpan={1} colSpan={1}>
              Player 3
            </GridItem>
            <GridItem rowStart={4} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem colStart={1} rowStart={5} rowSpan={1} colSpan={1}>
              Player 4
            </GridItem>
            <GridItem rowStart={5} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem colStart={1} rowStart={6} rowSpan={1} colSpan={1}>
              Player 5
            </GridItem>
            <GridItem rowStart={6} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={3} colStart={9} rowSpan={1} colSpan={1}>
              Dealer = 17
            </GridItem> */}
            <GridItem rowStart={4} colStart={8} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={4} colStart={9} rowSpan={1} colSpan={1} bg='tomato' />
            <GridItem rowStart={4} colStart={10} rowSpan={1} colSpan={1} bg='tomato' />
          </Grid>
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
>>>>>>> ad3f05b330ea1ef01eb8a32c097382af08f4fd8d
