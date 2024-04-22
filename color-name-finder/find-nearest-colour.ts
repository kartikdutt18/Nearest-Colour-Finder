import { colourDataset } from "./colour-set";

function rgbToLab(
  r: number,
  g: number,
  b: number
): { L: number; a: number; b: number } {
  // Convert RGB to XYZ
  let _r = r / 255;
  let _g = g / 255;
  let _b = b / 255;

  _r = _r > 0.04045 ? Math.pow((_r + 0.055) / 1.055, 2.4) : _r / 12.92;
  _g = _g > 0.04045 ? Math.pow((_g + 0.055) / 1.055, 2.4) : _g / 12.92;
  _b = _b > 0.04045 ? Math.pow((_b + 0.055) / 1.055, 2.4) : _b / 12.92;

  _r *= 100;
  _g *= 100;
  _b *= 100;

  const X = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
  const Y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
  const Z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;

  // Convert XYZ to LAB
  let var_X = X / 95.047; //ref_X =  95.047   Observer= 2°, Illuminant= D65
  let var_Y = Y / 100.0; //ref_Y = 100.000
  let var_Z = Z / 108.883; //ref_Z = 108.883

  var_X = var_X > 0.008856 ? Math.pow(var_X, 1 / 3) : 7.787 * var_X + 16 / 116;
  var_Y = var_Y > 0.008856 ? Math.pow(var_Y, 1 / 3) : 7.787 * var_Y + 16 / 116;
  var_Z = var_Z > 0.008856 ? Math.pow(var_Z, 1 / 3) : 7.787 * var_Z + 16 / 116;

  const L = 116 * var_Y - 16;
  const a = 500 * (var_X - var_Y);
  const bL = 200 * (var_Y - var_Z);

  return { L, a, b:bL };
}

export const hexToRgb = (hex: string): number[] => {
            return [
                parseInt(hex.substring(0, 2), 16),
                parseInt(hex.substring(2, 4), 16),
                parseInt(hex.substring(4, 6), 16)
            ];
        };

function deltaE(rgb1: number[], rgb2: number[]): number {
  const lab1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
  const lab2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);

  const deltaL = lab2.L - lab1.L;
  const deltaA = lab2.a - lab1.a;
  const deltaB = lab2.b - lab1.b;

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

export const getColourNameFromRGB = (r: number, g: number, b: number): string => {
  let minDeltaE = Infinity;
  let nearestColor = "";
  
  for (const [hex, name] of colourDataset) {
    const colorRgb = hexToRgb(hex);
    const deltaEValue = deltaE([r, g, b], colorRgb);

    if (deltaEValue < minDeltaE) {
      minDeltaE = deltaEValue;
      nearestColor = name;
    }
  }

  if (nearestColor == "") {
    throw new Error(`No colour found nearest to: r:${r}, g:${g}, b:${b}`);
  }

  return nearestColor;
};

export const getColourNameFromHex = (colour: string) => {
  const rgb = hexToRgb(colour);
  return getColourNameFromRGB(rgb[0], rgb[1], rgb[2]);
}