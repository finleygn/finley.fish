import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../../util/MousePosition";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourAlert implements IFishStateBehaviour {
  private timeout?: ReturnType<typeof setTimeout>;
  private static BEGIN_CHASE_TIMEOUT_MS = 500;

  private exclamations: HTMLSpanElement[] = [];
  private mouse: MousePositionTracker = new MousePositionTracker();

  constructor(fish: Fish, mouse: MousePositionTracker) {
    this.mouse = mouse;

    this.exclamations.push(this.createExclamationElement(fish, [10, -20], 0, "20px"),);

    this.timeout = setTimeout(() => {
      fish.setState(FishState.CHASE);
    }, FishStateBehaviourAlert.BEGIN_CHASE_TIMEOUT_MS)
  }

  public frame(_: number, fish: Fish) {
    const movementDirection = this.mouse.position.direction(fish.getPosition()).multiply(-1)
    fish.setDirection(movementDirection);
    fish.setVelocity(movementDirection);
    fish.setSpeed(1.0);
  }

  public cleanup(): void {
    for (const exclamation of this.exclamations) {
      exclamation.remove();
    }
    clearTimeout(this.timeout);
  }

  private createExclamationElement(
    fish: Fish,
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
    fish.containerElement.appendChild(element)
    return element;
  }
}

export default FishStateBehaviourAlert;