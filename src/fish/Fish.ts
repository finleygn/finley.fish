import IFishStateBehaviour from "./states/IFishStateBehaviour";
import FishStateBehaviourAlert from "./states/FishStateBehaviourAlert";
import FishStateBehaviourIdle from "./states/FishStateBehaviourIdle";
import Vector2 from "./Vector2";
import FishStateBehaviourChase from "./states/FishStateBehaviourChase";
import MousePositionTracker from "./MousePosition";

export enum FishState {
  IDLE,
  ALERT,
  CHASE,
  NIBBLING,
}

class Fish {
  public element: HTMLElement;

  private state: IFishStateBehaviour;
  private mousePositionTracker = new MousePositionTracker();

  private base_direction: Vector2 = new Vector2(-1, 0);
  private direction: Vector2 = this.base_direction;

  constructor(element: HTMLElement) {
    this.element = element;
    this.state = this.stateBehaviourFactory(FishState.IDLE);
  }

  /**
   * Update loop
   */
  public frame(dt: number) {
    this.state.frame?.(dt, this);
  }

  /**
   * State machine stuff
   */
  public setState(state: FishState) {
    this.state.cleanup(this);
    this.state = this.stateBehaviourFactory(state);
  }

  private stateBehaviourFactory(state: FishState) {
    switch (state) {
      case FishState.IDLE: return new FishStateBehaviourIdle(this.mousePositionTracker);
      case FishState.ALERT: return new FishStateBehaviourAlert(this, this.mousePositionTracker);
      case FishState.CHASE: return new FishStateBehaviourChase(this.mousePositionTracker);
      case FishState.NIBBLING: return new FishStateBehaviourIdle(this.mousePositionTracker);
    }
  }

  /**
   * Element positioning
   */
  public getPosition(): Vector2 {
    const width = this.element.offsetWidth;
    const height = this.element.offsetHeight;
    const top = this.element.offsetTop;
    const left = this.element.offsetLeft;

    return new Vector2(left + width * 0.5, top + height * 0.5);
  }

  public setPosition(position: Vector2): void {
    const width = this.element.offsetWidth;
    const height = this.element.offsetHeight;

    this.element.style.top = `${position.y - height * 0.5}px`;
    this.element.style.left = `${position.x - width * 0.5}px`;
  }

  public setDirection(direction: Vector2) {
    this.direction = direction;

    // We need to get the angle from -1,0 (base direction) to the given direction
    const angle = Math.atan2(this.base_direction.det(this.direction), this.base_direction.dot(this.direction));

    if (direction.x > 0) {
      this.element.style.transform = `scaleX(-1) rotate(calc(180deg - ${angle}rad))`;
    } else {
      this.element.style.transform = `scaleX(1) rotate(${angle}rad) `;
    }
  }

  public getDirection(): Vector2 {
    return this.direction;
  }
}

export default Fish