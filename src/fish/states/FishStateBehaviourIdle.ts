import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../../util/MousePosition";
import IFishStateBehaviour from "./IFishStateBehaviour";
import Vector2 from "../../util/Vector2";

class FishStateBehaviourIdle implements IFishStateBehaviour {
  private mouse: MousePositionTracker;
  private titleAnchor: HTMLElement;

  constructor(mouse: MousePositionTracker) {
    this.mouse = mouse;
    this.titleAnchor = document.getElementById('title')!;
  }

  public frame(_: number, fish: Fish) {
    const { left, top, width, height } = this.titleAnchor.getBoundingClientRect();
    const titleAnchorPoint = new Vector2(left + width + 25, top + height * 0.5 - 2);

    fish.setPosition(titleAnchorPoint);

    const distance = this.mouse.position.subtract(fish.getPosition());

    if (distance.magnitude() < 20) {
      const direction = distance.normalize();

      fish.setDirection(direction);
      fish.setState(FishState.ALERT);
    }
  }
}

export default FishStateBehaviourIdle;