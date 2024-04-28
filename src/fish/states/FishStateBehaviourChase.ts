import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import Vector2 from "../Vector2";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourChase implements IFishStateBehaviour {
  private elapsed = 0;
  private mousePositionTracker: MousePositionTracker;
  private lastKnownMousePosition: Vector2;

  constructor(mousePositionTracker: MousePositionTracker) {
    this.mousePositionTracker = mousePositionTracker;
    this.lastKnownMousePosition = mousePositionTracker.position;
  }

  public frame(dt: number, fish: Fish) {
    const direction = this.lastKnownMousePosition
      .subtract(fish.getPosition())
      .normalize();

    fish.setDirection(direction);

    const swimStrength = (Math.sin(this.elapsed * 0.002) + 1.0) * 0.5;
    this.elapsed += dt;

    if (this.mousePositionTracker.position.subtract(fish.getPosition()).magnitude() < 10) {
      fish.setState(FishState.NIBBLING);
    } else {
      fish.setPosition(
        fish.getPosition()
          .add(
            direction
              .multiply(dt * 0.4)
              .multiply(0.2 + 0.5 * swimStrength)
          )
      );
    }
    this.lastKnownMousePosition = this.lastKnownMousePosition.lerp(this.mousePositionTracker.position, 0.05);
  }

}

export default FishStateBehaviourChase;