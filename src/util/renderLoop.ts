export interface TimeData {
  elapsed: number;
  dt: number;
}

function renderLoop(fn: (data: TimeData) => void, longestFrame = 50) {
  let lastFrameTime = Date.now();
  let firstFrameTime = Date.now();

  const run = () => {
    const currentTime = Date.now();
    let dt = currentTime - lastFrameTime;
    if (dt > longestFrame) dt = longestFrame;

    lastFrameTime = currentTime;

    fn({ elapsed: lastFrameTime - firstFrameTime, dt });

    window.requestAnimationFrame(run);
  }

  window.addEventListener('resize', run);
  run();
}

export default renderLoop;