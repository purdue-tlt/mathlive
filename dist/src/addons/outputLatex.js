/**
 * This module outputs a formula to LaTeX.
 * 
 * To use it, use the {@linkcode MathAtom#toLatex MathAtom.toLatex()}  method.
 * 
 * @module addons/outputLatex
 * @private
 */

import MathAtom from '../core/mathAtom.js';
import Color from '../core/color.js';

function findLongestRun(atoms, property, value) {
    let i = 0;
    if (property === 'fontFamily') {
        while (atoms[i]) {
            if (atoms[i].type !== 'mop' && 
                (atoms[i].fontFamily || atoms[i].baseFontFamily) !== value) break
            i++;
        }
    } else {
        while (atoms[i]) {
            if (atoms[i].type !== 'mop' && 
                atoms[i][property] !== value) break
            i++;
        }
    }
    return i;
}

/**
 * 
 * @param {MathAtom} parent the parent or predecessor of the atom list
 * @param {MathAtom[]} atoms the list of atoms to transform to LaTeX
 * @param {object} options
 * @result {string} a LaTeX string
 */
function latexifyArray(parent, properties, atoms, options, targetProperty = 0) {
    if (atoms.length === 0) {
        return '';
    }

    if (targetProperty >= properties.length - 1) {
        // We've (recursively) checked all the atoms have the same properties
        return atoms.map(x => x.toLatex(options)).join('');
    }

    let result = '';
    let prefix = '';
    let suffix = '';

    // find the first atom's value for the target property
    const prop = properties[targetProperty];
    const atom = atoms[0]
    const propValue = prop === 'fontFamily' 
        ? atom.fontFamily || atom.baseFontFamily 
        : atom[prop];

    // find the "run", amount of consecutive atoms, that all share the same value for `prop`
    const i = findLongestRun(atoms, prop, propValue);

    // set the latex `prefix` and `suffix` to wrap the atoms in the `prop`'s style
    if (propValue || prop === 'mode') {
        if (atom.mode === 'text') {
            if (prop === 'mode') {
                let allAtomsHaveShapeOrSeriesOrFontFamily = true;
                for (let j = 0; j < i; j++) {
                    if (!atoms[j].fontSeries && 
                        !atoms[j].fontShape && 
                        !atoms[j].fontFamily &&
                        !atoms[j].baseFontFamily) {
                        allAtomsHaveShapeOrSeriesOrFontFamily = false;
                        break;
                    }
                }
                if (!allAtomsHaveShapeOrSeriesOrFontFamily) {
                    // Wrap in text, only if there isn't a shape or series on 
                    // all the atoms, because if so, it will be wrapped in a 
                    // \\textbf, \\textit, etc... and the \\text would be redundant
                    prefix = '\\text{';
                    suffix = '}';
                }
            } else if (prop === 'fontShape') {
                if (propValue === 'it') {
                    prefix = '\\textit{'
                } else if (propValue === 'sl') {
                    prefix = '\\textsl{'
                } else if (propValue === 'sc') {
                    prefix = '\\textsc{'
                } else if (propValue === 'n') {
                    prefix = '\\textup{'
                } else {
                    prefix = '\\text{\\fontshape{' + propValue + '}';
                }
                suffix = '}';
            } else if (prop === 'fontSeries') {
                if (propValue === 'b') {
                    prefix = '\\textbf{'
                } else if (propValue === 'l') {
                    prefix = '\\textlf{'
                } else if (propValue === 'm') {
                    prefix = '\\textmd{'
                } else {
                    prefix = '\\text{\\fontseries{' + propValue + '}';
                }
                suffix = '}';
            } else if (prop === 'fontFamily') {
                const command = {
                    'cmr': 'textrm',
                    'cmtt': 'texttt',
                    'cmss': 'textsf'
                }[propValue] || '';
                if (!command) {
                    prefix += '{\\fontfamily{' + propValue + '}';
                    suffix = '}';
                } else {
                    prefix = '\\' + command + '{';
                    suffix = '}';
                }
            }
        } else if (atom.mode === 'math') {
            if (prop === 'fontShape' && propValue === 'it') {
                prefix = '\\mathit{';
                suffix = '}';
            } else if (prop === 'fontSeries' && propValue === 'b' || prop === 'fontShape' && propValue === 'n' && atom['fontSeries'] === 'b') {
                prefix = '\\mathbf{';
                suffix = '}';
            } else if (prop === 'fontSeries' && propValue !== 'n') {
                prefix = '{\\fontseries{' + propValue + '}';
                suffix = '}';
            } else if (prop === 'fontShape') {
                if (propValue === 'n') {
                    prefix = '{\\upshape ';
                    suffix = '}';
                } else {
                    prefix = '{\\fontshape{' + propValue + '}';
                    suffix = '}';
                }
            } else if (prop === 'fontFamily') {
                if (!/^(math|main)$/.test(propValue)) {
                    const command = {
                        'cal': 'mathcal', 
                        'frak': 'mathfrak', 
                        'bb': 'mathbb',
                        'scr': 'mathscr',
                        'cmr': 'mathrm',
                        'cmtt': 'mathtt',
                        'cmss': 'mathsf'
                    }[propValue] || '';
                    if (!command) {
                        prefix += '{\\fontfamily{' + propValue + '}';
                        suffix = '}';
                    } else {
                        if (/^\\operatorname{/.test(atom.latex)) {
                            return atom.latex + latexifyArray(parent, properties, atoms.slice(i), options);
                        }
                        if (!atom.isFunction) {
                            prefix = '\\' + command + '{';
                            suffix = '}';
                        }
                        // These command have an implicit fontSeries/fontShape, so
                        // skip remaining properties
                        targetProperty = properties.length
                    }
                }
            }
        }

        if (prop === 'fontSize' && propValue) {
            const command = {
                'size1': 'tiny',
                'size2': 'scriptsize',
                'size3': 'footnotesize',
                'size4': 'small',
                'size5': 'normalsize',
                'size6': 'large',
                'size7': 'Large',
                'size8': 'LARGE',
                'size9': 'huge',
                'size10': 'Huge'
            }[propValue] || '';
            prefix = '{\\' + command + ' ';
            suffix = '}';
        }

        if (prop === 'color' && propValue &&
            propValue !== 'none' &&
            (!parent || parent.color !== propValue)) {
            prefix = '\\textcolor{' + Color.colorToString(propValue) + '}{';
            suffix = '}';
        }

        if (prop === 'backgroundColor' && propValue &&
            propValue !== 'none' &&
            (!parent || parent.backgroundColor !== propValue)) {
            prefix = '\\colorbox{' + Color.colorToString(propValue) + '}{';
            suffix = '}';
        }
    }

    const atomsInRun = atoms.slice(0, i);
    const atomsAfterRun = atoms.slice(i);

    // construct result latex string

    // wrap the atoms in the "run" in the style for the current `prop`
    result += prefix;

    // recurse to the next property for the atoms in the "run", to apply the remaining possible property styles
    result += latexifyArray(parent,
        properties,
        atomsInRun,
        options,
        targetProperty + 1);

    result += suffix;

    // append the latex result for the atoms after the current "run"
    if (atomsAfterRun.length > 0) {
        result += latexifyArray(parent, properties, atomsAfterRun, options);
    }

    return result;
}



/**
 * Given an atom or an array of atoms, return a LaTeX string representation
 * @return {string}
 * @param {string|MathAtom|MathAtom[]} value
 * @private
 */
function latexify(parent, value, options) {
    let result = '';
    if (Array.isArray(value) && value.length > 0) {
        if (value[0].type === 'first') {
            // Remove the 'first' atom, if present
            value = value.slice(1);
            if (value.length === 0) return '';
        }

        let properties = [
            'mode',
            'color',
            'backgroundColor',
            'fontSize',
            'fontFamily',
            'fontShape',
            'fontSeries'
        ]
        if (!options.outputStyles) {
            properties = properties.slice(0, 1)
        }

        result = latexifyArray(parent, properties, value, options);

        // if (result.startsWith('{') && result.endsWith('}')) {
        //     result = result.slice(1, result.length - 1);
        // }

    } else if (typeof value === 'number' || typeof value === 'boolean') {
        result = value.toString();
    } else if (typeof value === 'string') {
        result = value.replace(/\s/g, '~');
    } else if (value && typeof value.toLatex === 'function') {
        result = value.toLatex(options);
    }
    return result;
}



/**
 * Return a LaTeX representation of the atom.
 *
 * @param {object} options
 * @param {boolean} options.expandMacro - If true, macros are fully expanded. This will
 * no longer round-trip.
 * @param {boolean} options.outputStyles - If false, will not output any font, color, or style related commands.
 *
 * @return {string}
 * @method MathAtom#toLatex
 */
MathAtom.MathAtom.prototype.toLatex = function(options) {
    options = options || {
        expandMacro: false,
        outputStyles: true
    };
    let result = '';
    let col, row = 0;
    let i = 0;
    const m = !this.latex ? null : this.latex.match(/^(\\[^{\s0-9]+)/);
    const command = m ? m[1] : null;

    switch(this.type) {
        case 'group':
            result += this.latexOpen || ((this.cssId || this.cssClass) && options.outputStyles ? '' : '{');

            if (this.cssId && options.outputStyles) result += '\\cssId{' + this.cssId + '}{';

            if (this.cssClass === 'ML__emph' && options.outputStyles) {
                result += '\\emph{' + latexify(this, this.body, options) + '}';
            } else {
                if (this.cssClass && options.outputStyles) result += '\\class{' + this.cssClass + '}{';

                result += options.expandMacro ? latexify(this, this.body, options) :
                    (this.latex || latexify(this, this.body, options));

                if (this.cssClass) result += '}';
            }
            if (this.cssId && options.outputStyles) result += '}';

            result += this.latexClose || ((this.cssId || this.cssClass) && options.outputStyles ? '' : '}');
            break;

        case 'array':
            result += '\\begin{' + this.env.name + '}';
            if (this.env.name === 'array') {
                result += '{';
                if (this.colFormat) {
                    for (i = 0; i < this.colFormat.length; i++) {
                        if (this.colFormat[i].align) {
                            result += this.colFormat[i].align;
                        } else if (this.colFormat[i].rule) {
                            result += '|';
                        }
                    }
                }
                result += '}';
            }
            for (row = 0; row < this.array.length; row++) {
                for (col = 0; col < this.array[row].length; col++) {
                    if (col > 0) result += ' & ';
                    result += latexify(this, this.array[row][col], options);
                }
                // Adds a separator between rows (but not after the last row)
                if (row < this.array.length - 1) {
                    result += ' \\\\ ';
                }
            }
            result += '\\end{' + this.env.name + '}';
            break;

        case 'root':
            result = latexify(this, this.body, options);
            break;

        case 'genfrac':
            if (/^(choose|atop|over)$/.test(this.body)) {
                // Infix commands.
                result += '{';
                result += latexify(this, this.numer, options)
                result += '\\' + this.body + ' ';
                result += latexify(this, this.denom, options);
                result += '}';
            } else {
                // @todo: deal with fracs delimiters
                result += command;
                result += `{${latexify(this, this.numer, options)}}{${latexify(this, this.denom, options)}}`;
            }
            break;

        case 'surd':
            result += '\\sqrt';
            if (this.index) {
                result += '[';
                result += latexify(this, this.index, options);
                result += ']';
            }
            result += `{${latexify(this, this.body, options)}}`;
            break;

        case 'leftright':
            if (this.inner) {
                result += '\\left' + (this.leftDelim || '.');
                if (this.leftDelim && this.leftDelim.length > 1) result += ' ';
                result += latexify(this, this.body, options);
                result += '\\right' + (this.rightDelim || '.');
                if (this.rightDelim && this.rightDelim.length > 1) result += ' ';
            } else {
                result += this.leftDelim === '.' ? '' : '\\mleft' + (this.leftDelim || '.');
                if (this.leftDelim && this.leftDelim.length > 1) result += ' ';
                result += latexify(this, this.body, options);
                result += (!this.rightDelim || this.rightDelim === '.') ? '' : '\\mright' + (this.rightDelim || '.');
                if (this.rightDelim && this.rightDelim.length > 1) result += ' ';
            }
            break;

        case 'delim':
        case 'sizeddelim':
            result += command + '{' + this.delim + '}';
            break;

        case 'rule':
            result += command;
            if (this.shift) {
                result += `[${latexify(this, this.shift, options)}em]`;
            }
            result += `{${latexify(this, this.width, options)}em}{${latexify(this, this.height, options)}em}`;
            break;

        case 'line':
        case 'overlap':
        case 'accent':
            result += `${command}{${latexify(this, this.body, options)}}`;
            break;

        case 'overunder':
            result += `${command}{${latexify(this, this.overscript || this.underscript, options)}}{${latexify(parent, this.body, options)}}`;
            break;

        case 'mord':
        case 'minner':
        case 'mbin':
        case 'mrel':
        case 'mpunct':
        case 'mopen':
        case 'mclose':
        case 'textord':
        case '':        // mode = text
            if (/^\\(mathbin|mathrel|mathopen|mathclose|mathpunct|mathord|mathinner)/.test(command)) {
                result += command + '{' + latexify(this, this.body, options) + '}';
            } else if (command === '\\char"') {
                result += this.latex + ' ';
            } else if (command === '\\unicode') {
                result += '\\unicode{"';
                result += ('000000' + this.body.charCodeAt(0).toString(16)).toUpperCase().substr(-6);
                result += '}';
            } else if (this.latex || typeof this.body === 'string') {
                // Not ZERO-WIDTH
                if (this.latex && this.latex[0] === '\\') {
                    result += this.latex;
                    if (/[a-zA-Z0-9]$/.test(this.latex)) {
                        result += ' ';
                    }
                } else if (command) {
                    result += command;
                } else {
                    result += this.body !== '\u200b' ? (this.latex || this.body) : '';
                }
            }
            break;

        case 'mop':
            if (this.body !== '\u200b') {
                // Not ZERO-WIDTH
                if (command === '\\mathop') {
                    // The argument to mathop is math, therefor this.body can be an expression
                    result += command + '{' + latexify(this, this.body, options) + '}';
                } else if (command === '\\operatorname') {
                    // The argument to operator name is text, therefore this.body is a string
                    result += command + '{' + this.body + '}';
                } else {
                    if (this.latex && this.latex[0] === '\\') {
                        result += this.latex;
                        if (/[a-zA-Z0-9]$/.test(this.latex)) {
                            result += ' ';
                        }
                    } else if (command) {
                        result += command;
                    } else {
                        result += this.body !== '\u200b' ? (this.latex || this.body) : '';
                    }
                }
            }
            if (this.explicitLimits) {
                if (this.limits === 'limits') result += '\\limits ';
                if (this.limits === 'nolimits') result += '\\nolimits ';
            }
            break;


        case 'box':
            if (command === '\\bbox') {
                result += command;
                if (isFinite(this.padding) || 
                    typeof this.border !== 'undefined' || 
                    typeof this.backgroundcolor !== 'undefined') {
                    const bboxParams = [];
                    if (isFinite(this.padding)) {
                        bboxParams.push(Math.floor(1e2 * this.padding) / 1e2 + 'em')
                    }
                    if (this.border) {
                        bboxParams.push('border:' + this.border);
                    }
                    if (this.backgroundcolor) {
                        bboxParams.push(Color.colorToString(this.backgroundcolor));
                    }
                    result += `[${bboxParams.join(',')}]`;
                }
                result += `{${latexify(this, this.body, options)}}`;
            } else if (command === '\\boxed') {
                result += `\\boxed{${latexify(this, this.body, options)}}`;
            } else {
                // \\colorbox, \\fcolorbox
                result += command;
                if (this.framecolor) {
                    result += `{${Color.colorToString(this.framecolor)}}`;
                }
                if (this.backgroundcolor) {
                    result += `{${Color.colorToString(this.backgroundcolor)}}`;
                }
                result += `{${latexify(this, this.body, options)}}`;
            }
            break;

        case 'spacing':
            // Three kinds of spacing commands:
            // \hskip and \kern which take one implicit parameter
            // \hspace and hspace* with take one *explicit* parameter
            // \quad, etc... which take no parameters.
            result += command;
            if (command === '\\hspace' || command === '\\hspace*') {
                result += '{';
                if (this.width) {
                    result += this.width + 'em';
                } else {
                    result += '0em'
                }
                result += '}';
            } else {
                result += ' ';
                if (this.width) {
                    result += this.width + 'em ';
                }
            }


            break;

        case 'enclose':
            result += command;
            if (command === '\\enclose') {
                result += '{';
                let sep = '';
                for (const notation in this.notation) {
                    if (Object.prototype.hasOwnProperty.call(this.notation, notation) &&
                        this.notation[notation]) {
                        result += sep + notation;
                        sep = ' ';
                    }
                }
                result += '}';

                // \enclose can have optional parameters...
                let style = '';
                sep = '';
                if (this.backgroundcolor && this.backgroundcolor !== 'transparent') {
                    style += sep + 'mathbackground="' + Color.colorToString(this.backgroundcolor) + '"';
                    sep = ',';
                }
                if (this.shadow && this.shadow !== 'auto') {
                    style += sep + 'shadow="' + this.shadow + '"';
                    sep = ',';
                }
                if (this.strokeWidth !== 1 || this.strokeStyle !== 'solid') {
                    style += sep + this.borderStyle;
                    sep = ',';
                } else if (this.strokeColor && this.strokeColor !== 'currentColor') {
                    style += sep + 'mathcolor="' + Color.colorToString(this.strokeColor) + '"';
                    sep = ',';
                }


                if (style) {
                    result += `[${style}]`;
                }
            }
            result += `{${latexify(this, this.body, options)}}`;
            break;

        case 'mathstyle':
            result += '\\' + this.mathstyle + ' ';
            break;

        case 'space':
            result += this.latex;
            break;

        case 'placeholder':
            result += '\\placeholder{' + (this.value || '') + '}';
            break;

        case 'first':
        case 'command':
        case 'msubsup':
            break;

        case 'variable':
            result += `\\variable{${latexify(this, this.body, options)}}`;
            break;

        case 'error':
            result += this.latex;
            break;


        default:
            console.warn('Unexpected atom type "' + this.type + 
                '" in "' + (this.latex || this.value) + '"');
            break;

    }
    if (this.superscript) {
        let sup = latexify(this, this.superscript, options);
        if (sup === '\u2032') {     // PRIME
            sup = '\\prime ';
        } else if (sup === '\u2033') {      // DOUBLE-PRIME
            sup = '\\doubleprime ';
        }
        result += '^{' + sup + '}';
    }
    if (this.subscript) {
        const sub = latexify(this, this.subscript, options);
        result += '_{' + sub + '}';
    }
    return result;
}


// Export the public interface for this module
export default {
}



