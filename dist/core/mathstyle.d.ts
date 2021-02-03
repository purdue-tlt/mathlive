/* 0.59.0 *//**
 * This file contains information and classes for the 'math styles' used by TeX,
 * which are specific layout
 * algorithms for math. They get progressively smaller and tighter:
 * - displaystyle is used for expressions laid out on their own (in a block)
 * - textstyle is for expressions displayed on a line (usually wiht some text
 * around)
 * - scriptstyle is for expressions displayed as a superscript for example
 * - scriptscriptstyle is for expressions displayed as a superscript of a superscript
 * - the 'cramped' variations are used in various places, for examples a subscript
 * is using the 'scriptstyle', but cramped (so it's a bit more tight than a
 * superscript which is just using the 'scriptstyle')
 *
 * See Texbook, p.441:
 *
 * A math list is a sequence of items of the various kinds listed in Chapter 17,
 * and TEX typesets a formula by converting a math list to a horizontal list.
 * When such typesetting begins, TEX has two other pieces of information in
 * addition to the math list itself. (a) The starting style tells what style
 * should be used for the math list, unless another style is specified by a
 * style item. For example, the starting style for a displayed formula is D,
 * but for an equation in the text or an equation number it is T; and for a
 * subformula it can be any one of the eight styles defined in Chapter 17.
 *
 * We shall use C to stand for the current style, and we shall say that the
 * math list is being typeset in style C. (b) The typesetting is done either
 * with or without penalties. Formulas in the text of a paragraph are converted
 * to horizontal lists in which additional penalty items are inserted after
 * binary operations and relations, in order to aid in line breaking. Such
 * penalties are not inserted in other cases, because they would serve no
 * useful function.
 *
 * The eight styles are considered to be D > D′ > T > T′ > S > S′ > SS > SS′,
 * in decreasing order. Thus, C ≤ S means that the current style is S, S , SS,
 * or SS . Style C′ means the current style with a prime added if one isn’t
 * there; for example, we have C =T if and only if C = T or C = T'.
 * Style C↑ is the superscript style for C; this means style S if C is D or T,
 * style S′ if C is D′ or T′, style SS if C is S or SS,
 * and style SS if C is S or SS.
 * Finally, style C↓ is the subscript style, which is (C↑) .
 */
interface Metrics {
    slant: number;
    space: number;
    stretch: number;
    shrink: number;
    xHeight: number;
    quad: number;
    extraSpace: number;
    num1: number;
    num2: number;
    num3: number;
    denom1: number;
    denom2: number;
    sup1: number;
    sup2: number;
    sup3: number;
    sub1: number;
    sub2: number;
    supDrop: number;
    subDrop: number;
    delim1: number;
    delim2: number;
    axisHeight: number;
    emPerEx?: number;
}
/**
 * @property {number} id unique id for the style
 * @property {number} size (which is the same for cramped and uncramped version
 * of a style)
 * @property {number}  multiplier, size multiplier which gives the size difference between
 * a style and textstyle.
 * @property {boolean}  cramped flag
 */
export declare class Mathstyle {
    id: number;
    size: number;
    cramped: boolean;
    sizeMultiplier: number;
    metrics: Metrics;
    constructor(id: number, size: number, multiplier: number, cramped: boolean);
    /**
     * Get the style of a superscript given a base in the current style.
     */
    sup(): Mathstyle;
    /**
     * Get the style of a subscript given a base in the current style.
     */
    sub(): Mathstyle;
    /**
     * Get the style of a fraction numerator given the fraction in the current
     * style.
     */
    fracNum(): Mathstyle;
    /**
     * Get the style of a fraction denominator given the fraction in the current
     * style.
     */
    fracDen(): Mathstyle;
    /**
     * Get the cramped version of a style (in particular, cramping a cramped style
     * doesn't change the style).
     */
    cramp(): Mathstyle;
    /**
     * CSS class name, for example `displaystyle cramped`
     */
    cls(): string;
    /**
     * CSS class name to adjust from one style to another, like 'reset-textstyle'
     */
    adjustTo(newStyle: Mathstyle): string;
    /**
     * Return if this style is tightly spaced (scriptstyle/scriptscriptstyle)
     */
    isTight(): boolean;
}
export declare const MATHSTYLES: {
    [key: number]: Mathstyle;
    displaystyle?: Mathstyle;
    textstyle?: Mathstyle;
    scriptstyle?: Mathstyle;
    scriptscriptstyle?: Mathstyle;
};
export declare type MathStyleName = 'displaystyle' | 'textstyle' | 'scriptstyle' | 'scriptscriptstyle';
export {};
