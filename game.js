const boyColor = "blue";
const girlColor = "pink";
const random = "grey";
const mouseEvents = [];
const scratchPercents = [];
const colorMemory = [];

function setHeartColor(heartTarget, isLastOne) {
  if (isLastOne) {
    $(heartTarget).css("background-color", random);
    return;
  }
  const clrIndex = Math.round(Math.random());
  if (colorMemory.indexOf(clrIndex) < 0) {
    const color = clrIndex ? boyColor : girlColor;
    $(heartTarget).css("background-color", color);
    colorMemory.push(clrIndex);
    return;
  }
  setHeartColor(heartTarget, false);
}

function setCanvasRectFilled(canvas, ctx, heartTarget, isLastOne) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const img = new Image();
  img.onload = function () {
    const pattern = ctx.createPattern(this, "repeat");
    pattern.width = this.width;
    pattern.height = this.height;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (heartTarget !== null && isLastOne !== null) {
      setHeartColor(heartTarget, isLastOne);
    } else {
       $("#name-reveal").html('Maïna');
    }
  };
  img.src = "assets/baby.png";
}

function computeXAndY(e) {
  const isTouchEvent = e.type.startsWith("touch");
  if (isTouchEvent) {
    const rect = e.target.getBoundingClientRect();
    return {
      x: e.targetTouches[0].pageX - rect.left,
      y: e.targetTouches[0].pageY - rect.top,
    };
  }
  return { x: e.offsetX, y: e.offsetY };
}

function computePercentOfEmpty(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelCount = canvas.width * canvas.height;
  const arrayElemsCount = pixelCount * 4; // for components (rgba) per pixel.
  const dataArray = imageData.data;
  // 0 is completely transparent, set to 0.5 to
  // allow for instance semi transparent pixels to be accounted for
  const threshold = 0;
  let transparentPixelCount = 0;
  // remember fourth (index = 3) byte is alpha
  for (let i = 3; i < arrayElemsCount; i += 4) {
    let alphaValue = dataArray[i];
    if (alphaValue <= threshold) {
      transparentPixelCount++;
    }
  }
  let transparencyPercentage = (transparentPixelCount / pixelCount) * 100;
  return Math.round(transparencyPercentage * 100) / 100;
}

function initialiseNameScratchZone() {
  const nameCanvasSelector = $("#scratch-name");
  if (nameCanvasSelector.length > 0) {
    const nameCanvas = nameCanvasSelector.get(0);
    const nameCtx = nameCanvas.getContext("2d");
    setCanvasRectFilled(nameCanvas, nameCtx, null, null);
    initialiseEvents(nameCanvas, nameCtx, null, null);
  }
}

function initialiseEvents(canvas, ctx, heartNumber, heartslength) {
  $(canvas).on("mousedown touchstart", (e) => {
    let mousedown = true;
    if (heartNumber !== null && heartslength !== null) {
      mouseEvents[heartNumber] = mousedown;
    }
    $(canvas).on("mousemove touchmove", (e) => {
      if (mousedown) {
        const coord = computeXAndY(e);
        ctx.clearRect(coord.x - 15, coord.y - 15, 30, 30);
        if (heartNumber !== null && heartslength !== null) {
          scratchPercents[heartNumber] = computePercentOfEmpty(
            canvas,
            ctx,
            heartNumber
          );
        }
      }
    });

    $(canvas).on("mouseup touchend", () => {
      if (mousedown) {
        mousedown = false;
        if (heartNumber !== null && heartslength !== null) {
          mouseEvents[heartNumber] = mousedown;
          const percent =
            scratchPercents.reduce((a, b) => a + b, 0) / heartslength;

          console.log(percent);

          if (percent >= 70) {
            //   console.log("Ready for name");
            initialiseNameScratchZone();
          }
        }
      }
    });
  });
}

function initialiseHeartCanvas(heartNumber, heartslength, heartTarget) {
  const isLastOne = heartNumber === heartslength - 1;
  const scratchCanvas = $(`#scratch-heart-${heartNumber}`);
  if (scratchCanvas.length > 0 && heartTarget) {
    const canvas = scratchCanvas.get(0);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    setCanvasRectFilled(canvas, ctx, heartTarget, isLastOne);
    initialiseEvents(canvas, ctx, heartNumber, heartslength);
  }
}

$(document).ready(() => {
  console.log("here we go");
  const hearts = $("._heart");
  hearts.each((index) => {
    mouseEvents[index] = false;
    scratchPercents[index] = 0;
    initialiseHeartCanvas(index, hearts.length, hearts.get(index));
  });
});
