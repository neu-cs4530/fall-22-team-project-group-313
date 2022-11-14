import {
  Button,
  FormControl,
  FormLabel,
  Input,
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
            <GridItem colStart={1} rowStart={2} rowSpan={1} colSpan={1}>
              Player 1
            </GridItem>
            <GridItem rowStart={2} rowSpan={1} colSpan={1} bg='tomato'>
              {/* <Card card={'2h'} height='46px' back /> */}
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
            </GridItem>
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
