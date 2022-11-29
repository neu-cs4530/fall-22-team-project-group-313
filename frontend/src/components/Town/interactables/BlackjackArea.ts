import Interactable, { KnownInteractableTypes } from '../Interactable';

/** A class representing the frontend of a blackjack area */
export default class BlackjackArea extends Interactable {
  private _labelText?: Phaser.GameObjects.Text;

  private _isInteracting = false;

  getType(): KnownInteractableTypes {
    return 'blackjackArea';
  }

  removedFromScene(): void {}

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.playMessage() + this.leaderboard(),
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText.setVisible(false);
    this.setDepth(-1);
  }

  /** Displays a message depneding on if the game is full or not */
  playMessage(): string {
    let output = '';
    const bjController = this.townController.getBlackjackAreaController(this);

    if (bjController.game.players.length + bjController.game.queue.length >= 5) {
      output += 'This game is currently full.\n\n';
    } else {
      output += 'Press space to play Blackjack\n\n';
    }

    return output;
  }

  /** Creates a string representation of the current and historical leaderboard */
  leaderboard(): string {
    const currentLeaders = new Map();

    let output = 'Current Blackjack Leaders:\n';

    const bjController = this.townController.getBlackjackAreaController(this);

    // Get the current leaders dictionary from blackjack controller
    if (bjController.game.isStarted) {
      bjController.game.players.forEach(playerID =>
        currentLeaders.set(
          this.townController.players.find(player => player.id === playerID)?.userName +
            ':' +
            playerID,
          bjController.game.playerPoints[bjController.game.players.indexOf(playerID)],
        ),
      );
    }

    const currentLeadersSorted = new Map([...currentLeaders.entries()].sort((a, b) => b[1] - a[1]));

    if (!currentLeadersSorted || !bjController.game.isStarted) {
      output += 'No current players in this area.\n';
    }

    // Adds current leaderboard string
    let i = 1;
    let jsd = 1;
    for (const item of currentLeadersSorted) {
      if (jsd == 3) output += `${i}. ${item[0].split(':', 1)} - ${item[1]} points\n`;
      else output += `${i}. ${item[0].split(':', 1)} - ${item[1]} points\n`;
      if (item[1] != Array.from(currentLeadersSorted.values())[jsd]) i++;
      if (jsd == 3) break;
      jsd++;
    }

    output += '\nHistorical Blackjack Leaders:\n';

    const historicalLeaders = this.townController.blackjackHistoricalLeaders;

    const historicalLeadersSorted = new Map(
      [...historicalLeaders.entries()].sort((a, b) => b[1] - a[1]),
    );

    if (Array.from(historicalLeadersSorted.values()).length == 0) {
      output += 'No historical leaders in this town.';
    }

    // Adds historical leaderboard string
    i = 1;
    jsd = 1;
    for (const item of historicalLeadersSorted) {
      if (jsd == 3) output += `${i}. ${item[0].split(':', 1)} - ${item[1]} points\n`;
      else output += `${i}. ${item[0].split(':', 1)} - ${item[1]} points\n`;
      if (item[1] != Array.from(historicalLeadersSorted.values())[jsd]) i++;
      jsd++;
    }

    return output.trim();
  }

  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.playMessage() + this.leaderboard(),
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText.setVisible(false);
    this._labelText.setX(location.x);
    this._labelText.setY(location.y);
    this._labelText.setDepth(100);
    this._labelText.setVisible(true);
  }

  overlapExit(): void {
    this._labelText?.setVisible(false);
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  interact(): void {
    this._labelText?.setVisible(false);
    this._isInteracting = true;
    const bjController = this.townController.getBlackjackAreaController(this);

    if (bjController.game.players.length + bjController.game.queue.length < 5) {
      if (
        !bjController.gameOccupants.find(player => player.id == this.townController.ourPlayer.id)
      ) {
        const occupants = bjController.gameOccupants;
        occupants.push(this.townController.ourPlayer);
        bjController.gameOccupants = occupants;
      }
      bjController.gameAction = {
        index: bjController.gameAction == undefined ? 0 : bjController.gameAction.index + 1,
        playerID: this.townController.ourPlayer.id,
        GameAction: 'Join',
      };
      this.townController.emitBlackjackAreaUpdate(bjController);
    }
  }
}
