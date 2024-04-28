import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import Vector2 from "../Vector2";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourNibble implements IFishStateBehaviour {
  private mouse: MousePositionTracker;
  private elapsedTime: number = 0;

  constructor(mouse: MousePositionTracker) {
    this.mouse = mouse;
  }

  public frame(dt: number, fish: Fish) {
    const direction = new Vector2(0.5, -0.2).normalize();

    fish.setDirection(direction);
    this.elapsedTime += dt;

    if (
      this.mouse.position.distance(fish.getPosition()) > 60 && this.elapsedTime > 100
    ) {
      fish.setState(FishState.CHASE);
    } else {
      fish.setPosition(this.mouse.position.add(new Vector2(-12, 5)));
    }
  }
}

export default FishStateBehaviourNibble;