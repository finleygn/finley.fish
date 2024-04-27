import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourChase implements IFishStateBehaviour {
  private elapsed = 0;
  private mousePositionTracker: MousePositionTracker;

  constructor(mousePositionTracker: MousePositionTracker) {
    this.mousePositionTracker = mousePositionTracker;
  }

  public cleanup(): void {

  }

  public frame(dt: number, fish: Fish) {
    const distance = this.mousePositionTracker.position.subtract(fish.getPosition())
    const direction = distance.normalize();

    fish.setDirection(direction);

    fish.setPosition(
      fish.getPosition().add(direction.multiply(dt).multiply(0.1))
    );

    this.elapsed += dt;

    if (distance.magnitude() < 50) {
      fish.setState(FishState.IDLE);
    }
  }

}

export default FishStateBehaviourChase;