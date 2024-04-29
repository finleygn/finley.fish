import IFishStateBehaviour from "./states/IFishStateBehaviour";
import FishStateBehaviourAlert from "./states/FishStateBehaviourAlert";
import FishStateBehaviourIdle from "./states/FishStateBehaviourIdle";
import Vector2 from "../util/Vector2";
import FishStateBehaviourChase from "./states/FishStateBehaviourChase";
import MousePositionTracker from "../util/MousePosition";
import { cubicPulse } from "../util/math";

export enum FishState {
  IDLE,
  ALERT,
  CHASE
}

class Fish {
  public containerElement: HTMLElement;
  private iconElement: HTMLElement;
  private mouse: MousePositionTracker;

  private baseDirection: Vector2 = new Vector2(-1, 0);

  private stateBehaviour: IFishStateBehaviour;
  public state: FishState;

  public direction: Vector2 = this.baseDirection;
  public size: Vector2;
  public position: Vector2;
  // Should probably just make velocity and speed one thing...
  public velocity: Vector2 = this.baseDirection;
  public speed: number;

  constructor(containerElement: HTMLElement, iconElement: HTMLElement, mousePositionTracker: MousePositionTracker) {
    this.containerElement = containerElement;
    this.iconElement = iconElement;
    this.mouse = mousePositionTracker;

    this.state = FishState.IDLE;
    this.stateBehaviour = this.stateBehaviourFactory(this.state);

    this.position = this.getInitialPosition();
    this.size = this.getInitialSize();
    this.speed = 0;

    this.moveToTransform();
  }

  /**
   * Update loop
   */
  public frame(dt: number, fish: Fish[]) {
    this.setPosition(this.position.add(this.velocity.multiply(this.speed * dt)));

    this.stateBehaviour.frame?.(dt, this);

    this.velocity = this.velocity.lerp(this.direction, 0.01);

    // Push each instance of fish away from each other
    for (const fishie of fish) {
      if (fishie === this) break;
      const direction = this.getPosition().subtract(fishie.getPosition());
      const distance = direction.magnitude();

      this.velocity = this.velocity.add(direction.normalize().multiply(cubicPulse(0, 25, distance) * 0.1));
    }

    this.speed *= 0.1;
  }

  /**
   * State machine stuff
   */
  public setState(state: FishState) {
    this.stateBehaviour.cleanup?.(this);
    this.state = state;
    this.stateBehaviour = this.stateBehaviourFactory(state);
  }

  private stateBehaviourFactory(state: FishState) {
    switch (state) {
      case FishState.IDLE: return new FishStateBehaviourIdle(this.mouse);
      case FishState.ALERT: return new FishStateBehaviourAlert(this, this.mouse);
      case FishState.CHASE: return new FishStateBehaviourChase(this.mouse);
    }
  }

  /**
   * Entity getters/setters
   */
  public getVelocity(): Vector2 {
    return this.velocity;
  }

  public setVelocity(velocity: Vector2): void {
    this.velocity = velocity;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getPosition() {
    return this.position;
  }

  public setPosition(position: Vector2): void {
    // This should probably be transform...
    this.containerElement.style.transform = `translate(${position.x - this.size.x * 0.5}px, ${position.y - this.size.y * 0.5}px)`;
    this.position.x = position.x;
    this.position.y = position.y;
  }

  public setDirection(direction: Vector2) {
    this.direction = direction;

    // We need to get the angle from -1,0 (base direction) to the given direction
    const angle = Math.atan2(this.baseDirection.det(this.direction), this.baseDirection.dot(this.direction));

    if (direction.x > 0) {
      this.iconElement.style.transform = `scaleX(-1) rotate(calc(180deg - ${angle}rad))`;
    } else {
      this.iconElement.style.transform = `scaleX(1) rotate(${angle}rad) `;
    }
  }

  public getDirection(): Vector2 {
    return this.direction;
  }


  /**
   * HTML -> TS Environment
   */
  private moveToTransform(): void {
    this.containerElement.style.top = '0px';
    this.containerElement.style.left = '0px';
    // setting position to itself will apply the transform()
    this.setPosition(this.position);
  }

  private getInitialPosition(): Vector2 {
    const { top, left, width, height } = this.containerElement.getBoundingClientRect();
    return new Vector2(left + width * 0.5, top + height * 0.5);
  }

  private getInitialSize(): Vector2 {
    const { width, height } = this.containerElement.getBoundingClientRect();
    return new Vector2(width, height);
  }
}

export default Fish