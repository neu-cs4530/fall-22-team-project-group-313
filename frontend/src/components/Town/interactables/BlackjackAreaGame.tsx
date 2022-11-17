import { Container, Modal, ModalBody } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useBlackjackAreaController, useInteractable } from '../../../classes/TownController';
import BlackjackAreaController from '../../../classes/BlackjackAreaController';
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
  //   const townController = useTownController();
  //   const blackjackAreaController = useBlackjackAreaController(blackjackArea.name);
  //   const [selectIsOpen, setSelectIsOpen] = useState(viewingAreaController.video === undefined);
  //   const [viewingAreaVideoURL, setViewingAreaVideoURL] = useState(viewingAreaController.video);

  return <BlackjackAreaModal isOpen={true} close={() => {}} blackjackArea={blackjackArea} />;
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
