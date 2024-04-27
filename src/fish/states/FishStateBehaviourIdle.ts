import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourIdle implements IFishStateBehaviour {
  private mousePositionTracker: MousePositionTracker;

  constructor(mousePositionTracker: MousePositionTracker) {
    this.mousePositionTracker = mousePositionTracker;
  }

  public frame(_: number, fish: Fish) {
    const distance = this.mousePositionTracker.position.subtract(fish.getPosition())

    if (distance.magnitude() < 50) {
      const direction = distance.normalize();

      fish.setDirection(direction);
      fish.setState(FishState.ALERT);
    }
  }

  public cleanup(): void {
  }
}

export default FishStateBehaviourIdle;