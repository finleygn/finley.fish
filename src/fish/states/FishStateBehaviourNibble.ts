import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import Vector2 from "../Vector2";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourNibble implements IFishStateBehaviour {
  private mousePositionTracker: MousePositionTracker;

  constructor(mousePositionTracker: MousePositionTracker) {
    this.mousePositionTracker = mousePositionTracker;
  }

  public frame(_: number, fish: Fish) {
    const direction = new Vector2(0.5, -0.2).normalize();

    fish.setDirection(direction);

    if (this.mousePositionTracker.position.subtract(fish.getPosition()).magnitude() > 20) {
      fish.setState(FishState.CHASE);
    } else {
      fish.setPosition(this.mousePositionTracker.position.add(new Vector2(-12, 5)));
    }
  }
}

export default FishStateBehaviourNibble;