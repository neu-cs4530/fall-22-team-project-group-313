import Interactable, { KnownInteractableTypes } from '../Interactable';

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
      `Press space to play Blackjack\n\n` + this.leaderboard(),
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText.setVisible(false);
    //this.townController.getBlackjackAreaController(this);
    this.setDepth(-1);
  }

  leaderboard(): string {
    const currentLeaders = new Map([
      ['1', 100],
      ['2', 1000],
      ['3', 50],
      ['4', 75],
    ]);

    const historicalLeaders = new Map([
      ['1', 100],
      ['2', 1000],
      ['3', 50],
      ['4', 75],
    ]);

    let output = 'Current Blackjack Leaders:\n';

    // Get blackjack controller
    //this.townController.getBlackjackAreaController(this);

    // Get the current leaders dictionary from blackjack controller

    // Get the historical leaders dictionary from townController

    // Sort leaders dictionary
    const currentLeadersSorted = new Map([...currentLeaders.entries()].sort((a, b) => b[1] - a[1]));

    if (!currentLeadersSorted) {
      output += 'No players are currently playing in this area.';
    }

    // Iterate through dictionary
    let i = 1;
    for (const item of currentLeadersSorted) {
      output += `${i}. Player ${item[0]} with ${item[1]} points\n`;
      i++;
    }

    output += '\nHistorical Blackjack Leaders:\n';

    // Sort leaders dictionary
    const historicalLeadersSorted = new Map(
      [...historicalLeaders.entries()].sort((a, b) => b[1] - a[1]),
    );

    if (!historicalLeadersSorted) {
      output += 'No historical leaders in this town.';
    }

    // Iterate through dictionary
    let j = 1;
    for (const item of historicalLeadersSorted) {
      output += `${j}. Player ${item[0]} with ${item[1]} points\n`;
      j++;
    }

    return output.trim();
  }

  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
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
    // TODO: Delete player on Exit!
    this._labelText?.setVisible(false);
    this._isInteracting = true;
  }
}
