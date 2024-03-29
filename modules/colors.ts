/** Color handling utilities **/

export class RGBColor {
  /** The color's red component [0; 255] */
  readonly red: number;
  /** The color's green component [0; 255] */
  readonly green: number;
  /** The color's blue component [0; 255] */
  readonly blue: number;

  /**
   * Create a new RGB color struct from its components.
   * Use `parse()` for creating one from a string instead.
   *
   * @param red is the color's red component [0; 255]
   * @param green is the color's green component [0; 255]
   * @param blue is the color's blue component [0; 255]
   **/
  constructor(red: number, green: number, blue: number) {
    /**
     * Make sure an RGB component is within range
     * @param value is the RGB component to validate
     **/
    const checkRange = (value: number) => {
      if (value < 0 || value > 255)
        throw new RangeError("RGB value is not within range [0; 255]");
    };

    [red, green, blue].forEach(checkRange);

    this.red = Math.abs(red);
    this.green = Math.abs(green);
    this.blue = Math.abs(blue);
  }

  /**
   * Compute the relative luminance of this color.
   * @returns {number} the relative luminance between 0 (black) and 1 (white)
   **/
  relativeLuminance(): number {
    /**
     * Convert sRGB components to their gamma-expanded values.
     * @param value is the sRGB component to gamma-expand
     * @returns the gamma-expanded value
     **/
    const gammaExpanded = (value: number): number => {
      const sRGB = value / 255;

      return sRGB <= 0.03928
        ? sRGB / 12.91
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    };

    const [red, green, blue] = [this.red, this.green, this.blue].map(
      gammaExpanded
    );

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }

  /**
   * Compute the contrast ratio between this and another color.
   *
   * @param olor} other is another color
   * @returns the contrast ratio between this and the other color
   */
  contrastRatio(other: RGBColor): number {
    const L1 = Math.max(this.relativeLuminance(), other.relativeLuminance());
    const L2 = Math.min(this.relativeLuminance(), other.relativeLuminance());

    return (L1 + 0.05) / (L2 + 0.05);
  }

  /** Compute the best contrast color assuming the current as background.
   * @returns a color with a reasonably high contrast
   **/
  contrastColor(): RGBColor {
    const whiteContrast = this.contrastRatio(OFF_WHITE);
    const blackContrast = this.contrastRatio(OFF_BLACK);

    return whiteContrast > blackContrast ? OFF_WHITE : OFF_BLACK;
  }

  /**
   * Format this color for usage in CSS.
   * @returns {string} a CSS color string
   **/
  toCSS(): string {
    return `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }

  /**
   * Parse a CSS color string to RGBColor.
   * Only hexadecimal and RGB colors are supported.
   *
   * @param color is the color string to parse
   * @returns the parsed color
   */
  static parse(color: string): RGBColor {
    // first, remove all whitespace to make the RGB pattern simpler
    color = color.replace(/\s+/g, "");

    const hexPattern =
      /^#(?<red>[0-9a-f]{2})(?<green>[0-9a-f]{2})(?<blue>[0-9a-f]{2})$/i;
    const rgbPattern = /^rgb\((?<red>\d+),(?<green>\d+),(?<blue>\d+)\)$/i;

    const match = color.match(hexPattern) || color.match(rgbPattern);

    if (!match || !match.groups)
      throw new SyntaxError(`Cannot parse color string "${color}"`);

    const components = [
      match["groups"]["red"],
      match["groups"]["green"],
      match["groups"]["blue"],
    ];
    const radix = color.startsWith("#") ? 16 : 10;

    const [red, green, blue] = components.map((v) => parseInt(v, radix));

    return new RGBColor(red, green, blue);
  }
}

/// Contrast color for dark backgrounds
export const OFF_WHITE = RGBColor.parse("#F5F5F5");

/// Contrast color for light backgrounds
export const OFF_BLACK = RGBColor.parse("#0A0A0A");
