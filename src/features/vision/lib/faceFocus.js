function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toPercent(value) {
  return Number((value * 100).toFixed(2));
}

export function getFaceFocusStyle(focusBox) {
  if (!focusBox) {
    return undefined;
  }

  const focalX = toPercent(focusBox.centerX);
  const focalY = toPercent(focusBox.compositionY ?? focusBox.centerY);

  return {
    objectPosition: `${focalX}% ${focalY}%`,
    transform: `scale(${focusBox.zoom})`,
    transformOrigin: `${focalX}% ${focalY}%`,
  };
}

function getCoverSourceRect(image, targetWidth, targetHeight, focusBox) {
  const targetAspectRatio = targetWidth / targetHeight;
  const imageAspectRatio = image.width / image.height;

  let cropWidth = image.width;
  let cropHeight = image.height;

  if (imageAspectRatio > targetAspectRatio) {
    cropWidth = cropHeight * targetAspectRatio;
  } else {
    cropHeight = cropWidth / targetAspectRatio;
  }

  if (!focusBox) {
    return {
      sx: (image.width - cropWidth) / 2,
      sy: (image.height - cropHeight) / 2,
      sw: cropWidth,
      sh: cropHeight,
    };
  }

  cropWidth /= focusBox.zoom;
  cropHeight /= focusBox.zoom;

  const centerX = focusBox.centerX * image.width;
  const centerY = (focusBox.compositionY ?? focusBox.centerY) * image.height;
  const sx = clamp(centerX - cropWidth / 2, 0, image.width - cropWidth);
  const sy = clamp(centerY - cropHeight / 2, 0, image.height - cropHeight);

  return {
    sx,
    sy,
    sw: cropWidth,
    sh: cropHeight,
  };
}

export function drawFocusedCover(context, image, targetRect, focusBox) {
  const { sx, sy, sw, sh } = getCoverSourceRect(
    image,
    targetRect.width,
    targetRect.height,
    focusBox,
  );

  context.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    targetRect.x,
    targetRect.y,
    targetRect.width,
    targetRect.height,
  );
}