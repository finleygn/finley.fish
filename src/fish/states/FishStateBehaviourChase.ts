import Fish from "../Fish";
import MousePositionTracker from "../../util/MousePosition";
import Vector2 from "../../util/Vector2";
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
    fish.setDirection(this.lastMousePosition.direction(fish.getPosition()));

    if (this.mouse.position.distance(fish.getPosition()) < 10) {
      fish.setVelocity(fish.getVelocity().multiply(-1));
    }

    const swimStrength = (Math.sin(this.elapsed * 0.005) + 1.0) * 0.5;
    fish.setSpeed(1.0 + 0.5 * swimStrength);

    this.lastMousePosition = this.lastMousePosition.lerp(this.mouse.position, 0.05);
    this.elapsed += dt;
  }

}

export default FishStateBehaviourChase;