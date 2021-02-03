/* 0.59.0 */import { Style, ParseMode } from '../public/core';
import { Context } from './context';
import { Mathstyle } from './mathstyle';
declare const SPAN_TYPE: readonly ["", "chem", "mord", "mbin", "mop", "mrel", "mopen", "mclose", "mpunct", "minner", "spacing", "first", "latex", "composition", "error", "placeholder"];
export declare type SpanType = typeof SPAN_TYPE[number];
export declare function isSpanType(type: string): type is SpanType;
/**
 * A span is the most elementary element that can be rendered.
 * It is composed of an optional body of text and an optional list
 * of children (other spans). Each span can be decorated with
 * CSS classes and style attributes.
 *
 * @param content the items 'contained' by this node
 * @param classes list of classes attributes associated with this node


 * @property  type - For example, `'latex'`, `'mrel'`, etc...
 * @property classes - A string of space separated CSS classes
 * associated with this element
 * @property cssId - A CSS ID assigned to this span (optional)
 * @property htmlData - data fields assigned to this span (optional)
 * @property children - An array, potentially empty, of spans which
 * this span encloses
 * @property body - Content of this span. Can be empty.
 * @property style - A set of key/value pairs specifying CSS properties
 * associated with this element.
 * @property height - The measurement from baseline to top, in em.
 * @property depth - The measurement from baseline to bottom, in em.
 * @property width
 */
export declare class Span {
    type: SpanType;
    children?: Span[];
    value: string;
    classes: string;
    delim?: string;
    caret: ParseMode;
    isSelected: boolean;
    height?: number;
    depth?: number;
    skew?: number;
    italic?: number;
    maxFontSize?: number;
    isTight?: boolean;
    cssId?: string;
    htmlData?: string;
    svgBody?: string;
    svgOverlay?: string;
    svgStyle?: string;
    style: Record<string, string>;
    attributes?: Record<string, string>;
    constructor(content: string | Span | Span[], classes?: string, type?: SpanType);
    /**
     * Update the dimensions of this node based on its children:
     * - height: distance from bottom to top
     * - depth: distance from bottom to baseline
     * - maxFontSize: a size multiplier (typically set with commands such as \huge)
     */
    updateDimensions(): void;
    selected(isSelected: boolean): void;
    applyStyle(mode: ParseMode, style: Style, className?: string): void;
    /**
     * Set the value of a CSS property associated with this span.
     * For example, setStyle('border-right', 5.6, 'em');
     *
     * @param prop the CSS property to set
     * @param value a series of strings and numbers that will be concatenated.
     */
    setStyle(prop: string, ...value: (string | number)[]): void;
    setTop(top: number): void;
    get left(): number;
    set left(value: number);
    set right(value: number);
    set width(value: number);
    /**
     * Generate the HTML markup to represent this span.
     *
     * @param hskip - Space (in mu, 1/18em) to leave on the left side
     * of the span.
     * This is used to adjust the inter-spacing between spans of different types,
     * e.g. 'bin' and 'rel', according to the TeX rules (TexBook p.170)
     *
     * @param hscale - If a value is provided, the margins are scaled by
     * this factor.
     *
     * @return HTML markup
     */
    toMarkup(options?: {
        hskip?: number;
        hscale?: number;
    }): string;
    /**
     * Can this span be coalesced with 'span'?
     * This is used to 'coalesce' (i.e. group together) a series of spans that are
     * identical except for their value, and to avoid generating redundant spans.
     * That is: '12' ->
     *      "<span class='mord mathrm'>12</span>"
     * rather than:
     *      "<span class='mord mathrm'>1</span><span class='mord mathrm'>2</span>"
     */
    tryCoalesceWith(span: Span): boolean;
}
/**
 * Attempts to coalesce (merge) spans, for example consecutive text spans.
 * Return a new tree with coalesced spans.
 *
 */
export declare function coalesce(spans: Span[]): Span[];
export declare function height(spans: Span | Span[]): number;
export declare function depth(spans: Span | Span[]): number;
export declare function skew(spans: Span | Span[]): number;
export declare function italic(spans: Span | Span[]): number;
export declare function makeSymbol(fontFamily: string, symbol: string, classes?: string, type?: SpanType): Span;
export declare function makeStruts(content: Span, classes?: string, type?: SpanType): Span;
export declare function makeStyleWrap(type: SpanType, children: Span | Span[], fromStyle: Mathstyle, toStyle: Mathstyle, classes: string): Span;
/**
 * Add some SVG markup to be overlaid on top of the span
 */
export declare function addSVGOverlay(body: Span, svgMarkup: string, svgStyle: string): Span;
export declare function makeHlist(spans: Span | Span[], classes?: string, type?: SpanType): Span;
/**
 * Create a new span of type `vlist`, a set of vertically stacked items
 * @param elements  An array of Span and integer. The integer can be either some kerning information
 * or the value of an individual shift of the preceding child if in 'individualShift' mode
 * @param pos The method that will be used to position the elements in the vlist.
 *
 * One of:
 * - `"individualShift"`: each child must be followed by a number indicating how much to shift it (i.e. moved downwards)
 * - `"top"`: posData specifies the topmost point of the vlist (>0 move up)
 * - `"bottom"`: posData specifies the bottommost point of the vlist (>0 move down)
 * - `"shift"`: the baseline of the vlist will be positioned posData away from the baseline
 * of the first child. (>0 moves down)
 */
export declare function makeVlist(context: Context, elements: (number | Span[] | Span)[], pos?: 'shift' | 'top' | 'bottom' | 'individualShift', posData?: number): Span;
/**
 * Create a span that consist of a (stretchy) SVG element
 *
 * @param classes list of classes attributes associated with this node
 */
export declare function makeSVGSpan(svgBodyName: string): Span;
export {};
