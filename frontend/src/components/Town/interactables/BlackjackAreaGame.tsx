// import { Container, Modal, ModalBody } from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useBlackjackAreaController, useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import BlackjackAreaInteractable from './BlackjackArea';
import BlackjackAreaModal from './BlackjackAreaModal';

/**
 * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
 * a popup to set the video for a viewing area, or if the video is set, a video player.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function BlackjackArea({
  blackjackArea,
}: {
  blackjackArea: BlackjackAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const blackjackAreaController = useBlackjackAreaController(blackjackArea.name);
  const [selectIsOpen, setSelectIsOpen] = useState(true);

  const playerInGame =
    blackjackAreaController.game.players.find(id => id === townController.ourPlayer.id) ||
    blackjackAreaController.game.queue.find(id => id === townController.ourPlayer.id);

  if (
    blackjackAreaController.game.players.length + blackjackAreaController.game.queue.length < 5 ||
    playerInGame
  ) {
    return (
      <BlackjackAreaModal
        isOpen={selectIsOpen}
        close={() => setSelectIsOpen(false)}
        blackjackArea={blackjackArea}
      />
    );
  } else {
    return (
      <Modal isOpen={selectIsOpen} onClose={() => setSelectIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unable to join the game.</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            This Blackjack Area is currently full. Please try to rejoin later or find another area.
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
}

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function BlackjackAreaWrapper(): JSX.Element {
  const blackjackArea = useInteractable<BlackjackAreaInteractable>('blackjackArea');
  if (blackjackArea) {
    return <BlackjackArea blackjackArea={blackjackArea} />;
  }
  return <></>;
}
