import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../../util/MousePosition";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourIdle implements IFishStateBehaviour {
  private mouse: MousePositionTracker;

  constructor(mouse: MousePositionTracker) {
    this.mouse = mouse;
  }

  public frame(_: number, fish: Fish) {
    const distance = this.mouse.position.subtract(fish.getPosition());

    if (distance.magnitude() < 50) {
      const direction = distance.normalize();

      fish.setDirection(direction);
      fish.setState(FishState.ALERT);
    }
  }
}

export default FishStateBehaviourIdle;