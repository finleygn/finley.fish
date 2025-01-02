import default_vertex_shader_src from './shader/default.vert.glsl';
import waves_frag_shader_src from './shader/waves.frag.glsl';
import Fish, { FishState } from './fish/Fish';
import Vector2 from './util/Vector2';
import MousePositionTracker from './util/MousePosition';
import './main.css';
import { createProgram, createShader } from './shader/helpers';
import renderLoop, { TimeData } from './util/renderLoop';

const mouseTracker = new MousePositionTracker();

/**
 * DOM Lookup
 */
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const fishElement = <HTMLSpanElement>document.getElementsByClassName('fish')[0];
const fishIconElement = <HTMLSpanElement>document.getElementsByClassName('fish-icon')[0];
const addFishButton = <HTMLButtonElement>document.getElementsByClassName('add-fish')[0];

if (!canvas || !fishElement || !fishIconElement || !addFishButton) {
  throw new Error("No fish element found.");
}

/**
 * Fish
 */
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

  return newFish;
}

/**
 * Background
 */
function handleCanvasResize(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  const needResize = canvas.width != displayWidth || canvas.height != displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function setupWebGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error("WEBGL2 not supported.")
  
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, default_vertex_shader_src);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, waves_frag_shader_src);
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
  
  gl.useProgram(program);
  gl.bindVertexArray(vao);

  return { 
    gl,
    locations: {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution")
    }
  };
}

function start() {
  const originalFish = new Fish(fishElement, fishIconElement, mouseTracker);
  const fishSchool = [originalFish];

  addFishButton.onclick = (event) => {
    fishSchool.push(createNewFish(new Vector2(event.pageX, event.pageY)));
  }

  const { gl, locations } = setupWebGL(canvas);

  const onFrameBackground = (time: TimeData) => {
    handleCanvasResize(canvas);
  
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    gl.uniform1f(locations.time, time.elapsed);
    gl.uniform2fv(locations.resolution, [canvas.width, canvas.height]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  
  const onFrameFish = (time: TimeData) => {
    for (const fishie of fishSchool) {
      fishie.frame(time.dt, fishSchool);
    }
  
    // Show button when fish has moved sufficiently far from the starting position
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
  }

  renderLoop((time: TimeData) => {
    onFrameBackground(time);
    onFrameFish(time);
  });
}

start();