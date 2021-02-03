/* 0.59.0 */import { Context, ContextInterface } from './context';
import { Style, ParseMode } from '../public/core';
import { SpanType, Span } from './span';
export declare const ATOM_REGISTRY: {};
export declare type BranchName = 'above' | 'body' | 'below' | 'superscript' | 'subscript';
export declare type Branch = BranchName | [row: number, col: number];
/**
 * A _branch_ is a set of children of an atom.
 *
 * There are two kind of branches:
 * - **colRow** branches are adressed with a column and row number and are
 * used with ArrayAtom
 * - **named branches** used with other kind of atoms. There is a fixed set of
 * possible named branches.
 */
export declare function isNamedBranch(branch: Branch): branch is BranchName;
export declare function isColRowBranch(branch: Branch): branch is [number, number];
export declare type Branches = {
    [branch in BranchName]?: Atom[];
};
export declare type ToLatexOptions = {
    expandMacro?: boolean;
};
export declare type AtomType = 'accent' | 'array' | 'box' | 'chem' | 'composition' | 'delim' | 'enclose' | 'error' | 'first' | 'genfrac' | 'group' | 'latex' | 'leftright' | 'line' | 'macro' | 'mbin' | 'mclose' | 'minner' | 'mop' | 'mopen' | 'mord' | 'mpunct' | 'mrel' | 'msubsup' | 'overlap' | 'overunder' | 'placeholder' | 'phantom' | 'root' | 'rule' | 'sizeddelim' | 'space' | 'spacing' | 'surd' | 'text';
export declare type BBoxParameter = {
    backgroundcolor?: string;
    padding?: number;
    border?: string;
};
/**
 * An atom is an object encapsulating an elementary mathematical unit,
 * independent of its graphical representation.
 *
 * It keeps track of the content, while the dimensions, position and style
 * are tracked by Span objects which are created by the `decompose()` functions.
 */
export declare class Atom {
    parent: Atom | null;
    treeBranch: Branch;
    value: string;
    id?: string;
    type: AtomType;
    command: string;
    latex?: string;
    isExtensibleSymbol: boolean;
    isFunction: boolean;
    isSelected: boolean;
    containsCaret: boolean;
    caret: ParseMode | '';
    limits?: 'limits' | 'nolimits' | 'accent' | 'overunder' | 'auto';
    explicitLimits?: boolean;
    skipBoundary?: boolean;
    captureSelection?: boolean;
    style: Style;
    mode: ParseMode;
    _isDirty: boolean;
    _changeCounter: number;
    _children: Atom[];
    toLatexOverride?: (atom: Atom, options: ToLatexOptions) => string;
    private _branches;
    constructor(type: AtomType, options?: {
        command?: string;
        mode?: ParseMode;
        value?: string;
        isExtensibleSymbol?: boolean;
        isFunction?: boolean;
        limits?: 'limits' | 'nolimits' | 'accent' | 'overunder' | 'auto';
        style?: Style;
        toLatexOverride?: (atom: Atom, options: ToLatexOptions) => string;
    });
    get changeCounter(): number;
    get isDirty(): boolean;
    set isDirty(dirty: boolean);
    /**
     * Return a list of spans equivalent to atoms.
     * A span is the most elementary type possible, for example 'text'
     * or 'vlist', while the input atoms may be more abstract and complex,
     * such as 'genfrac'
     *
     * @param context Font family, variant, size, color, and other info useful
     * to render an expression
     * @param atoms - An array of atoms
     */
    static render(inputContext: ContextInterface, atoms: Atom[] | undefined): Span[] | null;
    /**
     * Given an atom or an array of atoms, return a LaTeX string representation
     */
    static toLatex(value: boolean | number | string | Atom | Atom[], options: ToLatexOptions): string;
    /**
     * The common ancestor between two atoms
     */
    static commonAncestor(a: Atom, b: Atom): Atom;
    /**
     * Default Latex emmiter.
     * Avoid calling directly, instead call `Atom.toLatex(atom)`
     * to correctly call per-definition emitters and use the cached verbatim
     * latex when applicable.
     */
    toLatex(options: ToLatexOptions): string;
    bodyToLatex(options: ToLatexOptions): string;
    aboveToLatex(options: ToLatexOptions): string;
    belowToLatex(options: ToLatexOptions): string;
    supsubToLatex(options: ToLatexOptions): string;
    get treeDepth(): number;
    /**
     * Return the atoms in the branch, if it exists, otherwise null
     */
    branch(name: Branch): Atom[] | null;
    /**
     * Return all the branches that exist.
     * Some of them may be empty.
     */
    get branches(): Branch[];
    /**
     * Return the atoms in the branch, if it exists, otherwise create it
     */
    createBranch(name: Branch): Atom[];
    get row(): number;
    get col(): number;
    get body(): Atom[];
    set body(atoms: Atom[]);
    get superscript(): Atom[];
    set superscript(atoms: Atom[]);
    get subscript(): Atom[];
    set subscript(atoms: Atom[]);
    get above(): Atom[];
    set above(atoms: Atom[]);
    get below(): Atom[];
    set below(atoms: Atom[]);
    get computedStyle(): Style;
    applyStyle(style: Style): void;
    getInitialBaseElement(): Atom;
    getFinalBaseElement(): Atom;
    isCharacterBox(): boolean;
    hasEmptyBranch(branch: Branch): boolean;
    setChildren(children: Atom[], branch: Branch): void;
    makeFirstAtom(branch: Branch): Atom;
    addChild(child: Atom, branch: Branch): void;
    addChildBefore(child: Atom, before: Atom): void;
    addChildAfter(child: Atom, after: Atom): void;
    addChildren(children: Atom[], branch: Branch): void;
    /**
     * Return the last atom that was added
     */
    addChildrenAfter(children: Atom[], after: Atom): Atom;
    removeBranch(name: Branch): Atom[];
    removeChild(child: Atom): void;
    get siblings(): Atom[];
    get firstSibling(): Atom;
    get lastSibling(): Atom;
    get isFirstSibling(): boolean;
    get isLastSibling(): boolean;
    get hasNoSiblings(): boolean;
    get leftSibling(): Atom;
    get rightSibling(): Atom;
    get hasChildren(): boolean;
    get firstChild(): Atom;
    get lastChild(): Atom;
    /**
     * All the children of this atom.
     *
     * The order of the atoms is the order in which they
     * are navigated using the keyboard.
     */
    get children(): Atom[];
    /**
     * Render this atom as an array of Spans
     *
     * @param context Font variant, size, color, etc...
     */
    render(context: Context): Span[] | null;
    attachSupsub(context: Context, nucleus: Span, type: SpanType): Span;
    attachLimits(context: Context, nucleus: Span, nucleusShift: number, slant: number): Span;
    /**
     * Add an ID attribute to both the span and this atom so that the atom
     * can be retrieved from the span later on (e.g. when the span is clicked on)
     */
    bind(context: Context, span: Span): Span;
    /**
     * Create a span with the specified body and with a class attribute
     * equal to the type ('mbin', 'inner', 'spacing', etc...)
     *
     */
    makeSpan(context: Context, value: string | Atom[]): Span;
}
