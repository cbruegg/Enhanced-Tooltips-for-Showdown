/**
 * @file `ComposerTheme.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.0
 */

import { type EditorThemeClasses } from 'lexical';
import styles from './ComposerTheme.module.scss';

export const ComposerTheme: EditorThemeClasses = {
  ltr: styles.ltr,
  rtl: styles.rtl,

  text: {
    bold: styles.textBold,
    italic: styles.textItalic,
    underline: styles.textUnderline,
    strikethrough: styles.textStrike,
    underlineStrikethrough: styles.textUnderlineStrike,
    code: styles.textCode,
  },

  link: styles.link,

  list: {
    ol: styles.listOrdered,
    ul: styles.listUnordered,
    listitem: styles.listItem,
    nested: {
      listitem: styles.listNestedItem,
    },
  },

  heading: {
    h1: styles.h1,
    h2: styles.h2,
    h3: styles.h3,
    h4: styles.h4,
    h5: styles.h5,
    h6: styles.h6,
  },

  paragraph: styles.paragraph,
  quote: styles.quote,

  code: styles.codeBlock,
  codeHighlight: {
    atrule: styles.codeTokenAttribute,
    attr: styles.codeTokenAttribute,
    boolean: styles.codeTokenProperty,
    builtin: styles.codeTokenFunction,
    cdata: styles.codeTokenComment,
    char: styles.codeTokenSelector,
    class: styles.codeTokenFunction,
    'class-name': styles.codeTokenFunction,
    comment: styles.codeTokenComment,
    constant: styles.codeTokenProperty,
    deleted: styles.codeTokenProperty,
    doctype: styles.codeTokenComment,
    entity: styles.codeTokenOperator,
    function: styles.codeTokenFunction,
    important: styles.codeTokenVariable,
    inserted: styles.codeTokenSelector,
    keyword: styles.codeTokenAttribute,
    namespace: styles.codeTokenVariable,
    number: styles.codeTokenProperty,
    operator: styles.codeTokenOperator,
    prolog: styles.codeTokenComment,
    property: styles.codeTokenProperty,
    punctuation: styles.codeTokenPunctuation,
    regex: styles.codeTokenVariable,
    selector: styles.codeTokenSelector,
    string: styles.codeTokenSelector,
    symbol: styles.codeTokenProperty,
    tag: styles.codeTokenProperty,
    url: styles.codeTokenOperator,
    variable: styles.codeTokenVariable,
  },

  /* table: null,
  tableAddColumns: null,
  tableAddRows: null,
  tableCellActionButton: null,
  tableCellActionButtonContainer: null,
  tableCellSelected: null,
  tableCell: null,
  tableCellHeader: null,
  tableCellResizer: null,
  tableRow: null,
  tableScrollableWrapper: null,
  tableSelected: null,
  tableSelection: null, */
};
