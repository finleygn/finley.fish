import Vector2 from "./Vector2";

class MousePositionTracker {
  public x: number = 0;
  public y: number = 0;

  constructor() {
    window.addEventListener('mousemove', (event: MouseEvent) => {
      this.x = event.pageX;
      this.y = event.pageY;
    })
  }

  get position(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

export default MousePositionTracker