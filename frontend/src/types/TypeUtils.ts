import { BlackjackArea, ConversationArea, Interactable, ViewingArea } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

/**
 * Test to see if an interactable is a blackjack area
 */
export function isBlackjackArea(interactable: Interactable): interactable is BlackjackArea {
  return 'gameAction' in interactable;
}
