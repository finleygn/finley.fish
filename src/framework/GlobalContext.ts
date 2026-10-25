import { AnimationEngine } from "@fishley/wwwgraphics/animation/engine"
import Mat2 from "../math/Mat2";
import Mat4, { perspective } from "../math/Mat4";

class GlobalContext {
  public gl: WebGL2RenderingContext;
  public animationEngine: AnimationEngine = new AnimationEngine();
  public asciiProjection: Mat2 = new Mat2();
  public perspectiveProjection: Mat4 = new Mat4();
  public canvas: HTMLCanvasElement

  constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    this.gl = gl;
    this.canvas = canvas;
    this.update(0);
  }

  public update(dt: number) {
    this.setAsciiProjection(this.canvas.clientWidth, this.canvas.clientHeight);
    this.setPerspectiveProjection(this.canvas.clientWidth, this.canvas.clientHeight);
    this.animationEngine.tick(dt);
  }

  private setAsciiProjection(width: number, height: number) {
    Mat2.orthographic(
      this.asciiProjection,
      width,
      height
    );
  }

  private setPerspectiveProjection(width: number, height: number) {
    perspective(
      this.perspectiveProjection,
      Math.PI / 3.5,
      width / height,
      0.1,
      100
    );
  }
}

export default GlobalContext;