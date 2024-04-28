import Fish, { FishState } from "../Fish";
import MousePositionTracker from "../MousePosition";
import Vector2 from "../Vector2";
import IFishStateBehaviour from "./IFishStateBehaviour";

class FishStateBehaviourChase implements IFishStateBehaviour {
  private elapsed = 0;
  private mouse: MousePositionTracker;
  private lastMousePosition: Vector2;

  constructor(mouse: MousePositionTracker) {
    this.mouse = mouse;
    this.lastMousePosition = mouse.position;
  }

  public frame(dt: number, fish: Fish) {
    const direction = this.lastMousePosition
      .subtract(fish.getPosition())
      .normalize();

    fish.setDirection(direction);

    const swimStrength = (Math.sin(this.elapsed * 0.002) + 1.0) * 0.5;
    this.elapsed += dt;

    const mouseToFishDistance = this.mouse.position.distance(fish.getPosition());

    if (mouseToFishDistance < 10) {
      fish.setState(FishState.NIBBLING);
      return;
    }

    fish.setPosition(
      fish.getPosition()
        .add(
          direction
            .multiply(dt * 0.4)
            .multiply(0.2 + 0.5 * swimStrength)
        )
    );

    this.lastMousePosition = this.lastMousePosition.lerp(this.mouse.position, 0.05);
  }

}

export default FishStateBehaviourChase;