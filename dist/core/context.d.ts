/* 0.59.0 */import { MacroDictionary, ParseMode } from '../public/core';
import { Mathstyle } from './mathstyle';
import { Span } from './span';
export declare type ArgumentType = ParseMode | ('auto' | 'bbox' | 'color' | 'colspec' | 'delim' | 'dimen' | 'number' | 'skip' | 'string' | 'balanced-string');
export interface ContextInterface {
    macros?: MacroDictionary;
    atomIdsSettings?: {
        overrideID?: string;
        groupNumbers: boolean;
        seed: string | number;
    };
    mathstyle?: Mathstyle;
    parentMathstyle?: Mathstyle;
    size?: string;
    parentSize?: string;
    letterShapeStyle?: 'tex' | 'french' | 'iso' | 'upright' | 'auto';
    opacity?: number;
    color?: string;
    smartFence?: boolean;
    phantomBase?: Span[];
}
/**
 * This structure contains the rendering context of the current parse level.
 *
 * It also holds information about the parent context to handle scaling
 * adjustments.
 *
 * When a new scope is entered, a clone of the context is created with `.clone()`
 * so that any further changes remain local to the scope.
 *
 * A scope is defined for example by:
 * - an explicit group enclosed in braces `{...}`
 * - a semi-simple group enclosed in `\bgroup...\endgroup`
 * - an environment delimited by `\begin{<envname>}...\end{<envname>}`
 *
 * @property {Mathstyle} mathstyle
 * @property {number} opacity
 * @property {number} size
 * @property {object} atomIdsSettings - If not undefined, unique IDs should be
 * generated for each span so they can be mapped back to an atom.
 * The `seed` field should be a number to generate a specific range of
 * IDs or the string "random" to generate a random number.
 * Optionally, if a `groupNumbers` property is set to true, an additional
 * span will enclose strings of digits. This is used by read aloud to properly
 * pronounce (and highlight) numbers in expressions.
 * @property {Mathstyle} parentMathstyle
 * @property {number} parentSize
 * @property {object} macros A macros dictionary
 * @property {string} color
 */
export declare class Context implements ContextInterface {
    macros: MacroDictionary;
    atomIdsSettings?: {
        overrideID?: string;
        groupNumbers: boolean;
        seed: string | number;
    };
    mathstyle: Mathstyle;
    parentMathstyle?: Mathstyle;
    size?: string;
    parentSize?: string;
    letterShapeStyle: 'tex' | 'french' | 'iso' | 'upright' | 'auto';
    opacity?: number;
    color?: string;
    smartFence?: boolean;
    phantomBase?: Span[];
    constructor(from: ContextInterface);
    /**
     * Returns a new context with the same properties as 'this',
     * except for the ones provided in `override`
     */
    clone(override?: ContextInterface): Context;
    /**
     * Change the mathstyle of this context
     * @param value - `'auto'` to indicate that the mathstyle should in
     * fact not be changed. This is used when specifying the mathstyle for some
     * environments.
     */
    setMathstyle(value: string): void;
    cramp(): Context;
    sup(): Context;
    sub(): Context;
}
