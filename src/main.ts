import default_vertex_shader_src from './shader/default.vert.glsl';
import bricks_frag_shader_src from './shader/bricks.frag.glsl';
import Fish, { FishState } from './fish/Fish';
import Vector2 from './util/Vector2';
import MousePositionTracker from './util/MousePosition';
import './main.css';
import { createProgram, createShader } from './shader/helpers';

const mouseTracker = new MousePositionTracker();

/**
 * Fish setup
 */
const fishElement = <HTMLSpanElement>document.getElementsByClassName('fish')[0];
const fishIconElement = <HTMLSpanElement>document.getElementsByClassName('fish-icon')[0];
const addFishButton = <HTMLButtonElement>document.getElementsByClassName('add-fish')[0];

if (!fishElement || !fishIconElement || !addFishButton) {
  throw new Error("No fish element found.");
}

const originalFish = new Fish(fishElement, fishIconElement, mouseTracker);
const fishSchool = [originalFish];

function createNewFish(from: Vector2) {
  const fishDom = fishElement.cloneNode(true) as HTMLDivElement;
  const fishIconDom = <HTMLSpanElement>fishDom.getElementsByClassName('fish-icon')[0];

  fishDom.style.top = `${Math.random() * window.innerHeight}px`;
  fishDom.style.left = `${Math.random() * window.innerWidth}px`;
  fishDom.style.transform = ''
  document.body.prepend(fishDom);

  const newFish = new Fish(fishDom, fishIconDom, mouseTracker);
  const lookDirection = from.direction(newFish.getPosition());
  newFish.setDirection(lookDirection);
  newFish.setVelocity(lookDirection);
  newFish.setState(FishState.CHASE);

  fishSchool.push(newFish); // Add to the school c:
}

addFishButton.onclick = (event) => {
  createNewFish(new Vector2(event.pageX, event.pageY))
}

/**
 * Background stuffs
 */
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
if (!canvas) throw new Error("No canvas found.");

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("WEBGL2 not supported.")

const vertexShader = createShader(gl, gl.VERTEX_SHADER, default_vertex_shader_src);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, bricks_frag_shader_src);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Full screen tri
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);

const vao = gl.createVertexArray();
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

gl.useProgram(program);
gl.bindVertexArray(vao);

/**
 * Render loop
 */
const time0 = (new Date()).getTime();
let lastFrameTime = Date.now();
const longestFrame = 50;

const resizeAndDraw = () => {
  requestAnimationFrame(resizeAndDraw);

  const currentTime = Date.now();
  let dt = currentTime - lastFrameTime;
  if (dt > longestFrame) dt = longestFrame;

  lastFrameTime = currentTime;

  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  const needResize = canvas.width != displayWidth || canvas.height != displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform1f(timeLocation, (new Date()).getTime() - time0);
  gl.uniform2fv(resolutionLocation, [canvas.width, canvas.height]);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  for (const fishie of fishSchool) {
    fishie.frame(dt, fishSchool);
  }

  if (addFishButton.style.visibility !== "hidden") {
    const fishPosition = originalFish.getPosition();
    const { top, left, width, height } = addFishButton.getBoundingClientRect();
    const windowFishPosition = new Vector2(fishPosition.x, fishPosition.y);
    const windowAddFishButtonPosition = new Vector2(left + width * 0.5, top + height * 0.5);

    if (windowFishPosition.distance(windowAddFishButtonPosition) > 70 && originalFish.state !== FishState.IDLE) {
      addFishButton.style.visibility = "visible"
      addFishButton.classList.add("add-fish--visible");
    }
  }
};

resizeAndDraw();
window.addEventListener('resize', resizeAndDraw);
