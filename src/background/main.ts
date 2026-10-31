import { lerp } from "@fishley/wwwgraphics/math";
import { renderLoop } from "@fishley/wwwgraphics/app";
import imageAsciiCharset from "../assets/ascii.png";
import imageLilypad from "../assets/lilypad.png";
import { appCanvas } from "./element";
import GlobalContext from "./framework/GlobalContext";
import { createWebGLInstance, loadTexture } from "./framework/webgl";
import FrameBuffer from "./framework/FrameBuffer";
import * as mat4 from "@fishley/wwwgraphics/math/mat4";
import Vec3 from "@fishley/wwwgraphics/math/vec3";
import createScene from "./scene";
import { setupMouseClicks } from "./click";
import mouseTracker from "./mouse";
import { isPath } from "../lib/path";

const gl = createWebGLInstance(appCanvas);
gl.clearColor(0, 0, 0, 1);

const texture_charset = loadTexture(gl, imageAsciiCharset.src);
const texture_lilypad = loadTexture(gl, imageLilypad.src);

const globalContext = new GlobalContext(gl, appCanvas);
const { ascii, fish, ripples, thePlane, lilypads } = createScene(globalContext);

setupMouseClicks(globalContext, thePlane, ripples);

const maskFrameBuffer = new FrameBuffer(gl, appCanvas.width, appCanvas.height);
const asciiFrameBuffer = new FrameBuffer(gl, appCanvas.width, appCanvas.height);

//

const SCALE = 2.4;
const PLANE_OFFSET = new Vec3(0, 0, -2);
const PLANE_OFFSET_PROEJCTS = new Vec3(0.5, 0, -2);
const PLANE_SCALE = new Vec3(SCALE, SCALE, 1);

renderLoop(
  (frame) => {
    globalContext.update(frame.dt);
    mouseTracker.update(frame.dt);

    mat4.identity(thePlane.modelMatrix);

    if(isPath(window.location.pathname, '/projects')) {
      mat4.translate(thePlane.modelMatrix, PLANE_OFFSET_PROEJCTS);
      mat4.rotate(thePlane.modelMatrix, lerp(-0.1, 0.1, mouseTracker.y), {
        x: 1,
        y: 0,
        z: 0,
      });
      mat4.rotate(thePlane.modelMatrix, lerp(-0.5, 0.1, mouseTracker.x), {
        x: 0,
        y: 1,
        z: 0,
      });
    } else {
      mat4.translate(thePlane.modelMatrix, PLANE_OFFSET);
      mat4.rotate(thePlane.modelMatrix, lerp(-1.1, -0.8, mouseTracker.y), {
        x: 1,
        y: 0,
        z: 0,
      });
      mat4.rotate(thePlane.modelMatrix, lerp(-0.2, 0.2, mouseTracker.x), {
        x: 0,
        y: 0,
        z: 1,
      });
      mat4.rotate(thePlane.modelMatrix, lerp(-0.5, 0, mouseTracker.x), {
        x: 0,
        y: 1,
        z: 0,
      });

    }
    mat4.scale(thePlane.modelMatrix, PLANE_SCALE);


    for (const f of fish) {
      f.update(frame.dt);
    }

    // The plane is square, so render the mask and ascii square too or they get stretched onto it
    maskFrameBuffer.setTextureDimensions(appCanvas.width, appCanvas.height);
    asciiFrameBuffer.setTextureDimensions(appCanvas.width, appCanvas.height);

    // draw black and white
    maskFrameBuffer.draw(() => {
      for (const f of fish) {
        f.draw();
      }

      ripples.draw();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture_lilypad);

      lilypads.forEach((p) => p.draw());
    });

    // draw ascii
    asciiFrameBuffer.draw(() => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskFrameBuffer.outputTexture);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture_charset);

      gl.clear(gl.COLOR_BUFFER_BIT);
      ascii.draw();
    });

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, asciiFrameBuffer.outputTexture);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    thePlane.draw();

    gl.clearColor(0, 0, 0, 1);
  },
  { longestFrame: 1000 / 60 },
);
