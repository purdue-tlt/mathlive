/* 0.59.0 */import { ParseMode } from '../public/core';
import { Atom } from './atom-class';
/**
/**
 * Return an atom suitable for use as the root of a formula.
 */
export declare function makeRoot(parseMode: ParseMode, body?: Atom[]): Atom;
export declare function isAtomArray(arg: string | Atom | Atom[]): arg is Atom[];
