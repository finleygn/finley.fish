import { AutonomousSmoothValue } from "@fishley/wwwgraphics/animation";
import { MousePositionTracker } from "@fishley/wwwgraphics/interaction";

export class SmoothMouse {
  private trailing: {
    x: AutonomousSmoothValue;
    y: AutonomousSmoothValue;
  };
  private tracker: MousePositionTracker;

  constructor(startingX: number, startingY: number, strength: number) {
    this.trailing = {
      x: new AutonomousSmoothValue(startingX, strength),
      y: new AutonomousSmoothValue(startingY, strength),
    };
    this.tracker = new MousePositionTracker(startingX, startingY);
  }

  public update(dt: number) {
    this.trailing.x.target = this.tracker.x;
    this.trailing.y.target = this.tracker.y;
    // Slowly approach the mouse position
    this.trailing.x.tick(dt);
    this.trailing.y.tick(dt);
  }

  get y() {
    return this.trailing.y.value;
  }
  
  get x() {
    return this.trailing.x.value;
  }
}

const mouseTracker = new SmoothMouse(0.5, 0.5, 0.08);
export default mouseTracker;
