import IFishStateBehaviour from "./states/IFishStateBehaviour";
import FishStateBehaviourAlert from "./states/FishStateBehaviourAlert";
import FishStateBehaviourIdle from "./states/FishStateBehaviourIdle";
import Vector2 from "./Vector2";
import FishStateBehaviourChase from "./states/FishStateBehaviourChase";
import MousePositionTracker from "./MousePosition";
import FishStateBehaviourNibble from "./states/FishStateBehaviourNibble";

export enum FishState {
  IDLE,
  ALERT,
  CHASE,
  NIBBLING,
}

class Fish {
  public containerElement: HTMLElement;
  public iconElement: HTMLElement;

  private state: IFishStateBehaviour;
  private mousePositionTracker = new MousePositionTracker();

  private base_direction: Vector2 = new Vector2(-1, 0);
  private direction: Vector2 = this.base_direction;

  constructor(containerElement: HTMLElement, iconElement: HTMLElement) {
    this.containerElement = containerElement;
    this.iconElement = iconElement;
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
    this.state.cleanup?.(this);
    this.state = this.stateBehaviourFactory(state);
  }

  private stateBehaviourFactory(state: FishState) {
    switch (state) {
      case FishState.IDLE: return new FishStateBehaviourIdle(this.mousePositionTracker);
      case FishState.ALERT: return new FishStateBehaviourAlert(this, this.mousePositionTracker);
      case FishState.CHASE: return new FishStateBehaviourChase(this.mousePositionTracker);
      case FishState.NIBBLING: return new FishStateBehaviourNibble(this.mousePositionTracker);
    }
  }

  /**
   * Element positioning
   */
  public getPosition(): Vector2 {
    const { top, left, width, height } = this.containerElement.getBoundingClientRect();

    return new Vector2(left + width * 0.5, top + height * 0.5);
  }

  public setPosition(position: Vector2): void {
    const { width, height } = this.containerElement.getBoundingClientRect();

    this.containerElement.style.top = `${position.y - height * 0.5}px`;
    this.containerElement.style.left = `${position.x - width * 0.5}px`;
  }

  public setDirection(direction: Vector2) {
    this.direction = direction;

    // We need to get the angle from -1,0 (base direction) to the given direction
    const angle = Math.atan2(this.base_direction.det(this.direction), this.base_direction.dot(this.direction));

    if (direction.x > 0) {
      this.iconElement.style.transform = `scaleX(-1) rotate(calc(180deg - ${angle}rad))`;
    } else {
      this.iconElement.style.transform = `scaleX(1) rotate(${angle}rad) `;
    }
  }

  public getDirection(): Vector2 {
    return this.direction;
  }
}

export default Fish