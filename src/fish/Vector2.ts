import { lerp } from "./math";

class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public subtract(other: Vector2) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  public divide(scalar: number) {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  public multiply(scalar: number) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public add(other: Vector2) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  public normalize(): Vector2 {
    const magnitude = this.magnitude();
    return Vector2.from(this).divide(magnitude);
  }

  public magnitude(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  public dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  public det(other: Vector2): number {
    return this.x * other.y - this.y * other.x;
  }

  public lerp(other: Vector2, t: number): Vector2 {
    return new Vector2(lerp(this.x, other.x, t), lerp(this.y, other.y, t));
  }

  static from(vector: Vector2): Vector2 {
    return new Vector2(vector.x, vector.y)
  }
}

export default Vector2;