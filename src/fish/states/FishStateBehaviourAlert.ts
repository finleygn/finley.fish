import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourAlert implements IFishStateBehaviour {
  private timeout?: ReturnType<typeof setTimeout>;
  private CHASE_TIMEOUT_MS = 500;

  private exclamations: HTMLSpanElement[] = [];
  private mousePositionTracker: MousePositionTracker = new MousePositionTracker();

  constructor(fish: Fish, mousePositionTracker: MousePositionTracker) {
    const { x, y } = fish.getPosition();

    this.mousePositionTracker = mousePositionTracker;

    this.exclamations.push(
      this.createExclamationElement([x - 0, y - 40], 0, "20px"),
    );

    this.timeout = setTimeout(() => {
      fish.setState(FishState.CHASE);
    }, this.CHASE_TIMEOUT_MS)
  }

  public cleanup(): void {
    for (const exclamation of this.exclamations) {
      exclamation.remove();
    }
    clearTimeout(this.timeout);
  }

  public frame(_: number, fish: Fish) {
    const direction = this.mousePositionTracker.position
      .subtract(fish.getPosition())
      .normalize();

    fish.setDirection(direction);
  }

  private createExclamationElement(
    position: [number, number],
    delay: number,
    size: string
  ): HTMLSpanElement {
    const element = document.createElement('span');
    element.id = 'exclamation'; // css will handle the animation here
    element.style.left = `${position[0]}px`;
    element.style.top = `${position[1]}px`;
    element.style.animationDelay = `${delay}ms`;
    element.style.fontSize = size;
    element.innerHTML = "!"
    document.body.appendChild(element)
    return element;
  }
}

export default FishStateBehaviourAlert;