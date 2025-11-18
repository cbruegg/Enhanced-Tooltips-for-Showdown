/**
 * @file `mini-edit.d.ts` - Adapted from `pokemon-showdown-client/play.pokemonshowdown.com/src/miniedit.tsx`.
 * @author Keith Choison <keith@tize.io>
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 * @since 1.3.0
 */

/* eslint-disable max-classes-per-file */

declare namespace Showdown {
  const MAX_UNDO_HISTORY = 100 as const;

  interface MiniEditSelection {
    start: number;
    end: number;
  }

  type MiniEditPlugin = new (editor: MiniEdit) => unknown;

  /**
   * Basically an HTML `contentEditable` element that implements a non-monospaced code editor w/ syntax highlighting.
   */
  class MiniEdit {
    public static plugins: MiniEditPlugin[] = [];

    public element: HTMLElement;

    /**
     * Takes the element's plaintext `textContent` & renders it w/ syntax-highlighting.
     *
     * * Must not change the resulting `textContent` since the data needs to flow both ways to correctly respond to all
     *   possible ways users can input text.
     * * Should add a trailing newline (i.e., `'\n'`) if the text doesn't end with one.
     *   - HTML ignores trailing newlines, so if one didn't exist & the user typed one in at the end, it wouldn't appear.
     */
    public _setContent: (text: string) => void;
    public pushHistory?: (text: string, selection: MiniEditSelection) => void;
    public onKeyDown: (event: KeyboardEvent) => void;

    public constructor(
      element: HTMLElement,
      options: {
        setContent: MiniEdit['_setContent'];
        onKeyDown?: MiniEdit['onKeyDown'];
      },
    );

    /** Return `true` from the `callback()` for an early `return`. */
    private traverseText(node: Node, callback: (node: Text) => boolean): boolean;
    public setValue(text: string, selection = this.getSelection()): void;
    public getValue(): string;
    public reformat(selection?: MiniEditSelection): void;
    public replaeSelection(text: string): void;
    public getSelection(): MiniEditSelection;
    public setSelection(selection: MiniEditSelection): void;
    public select(): void;
  }

  class MiniEditPastePlugin {
    public constructor(editor: MiniEdit);
  }

  /**
   * Can't use the native undo/redo feature cause the syntax highlighting gives browsers an aneurysm,
   * so we have to reimplement it.
   *
   * * `Ctrl`+`Z` & `Ctrl`+`Y` can be intercepted but not the native menus (e.g., Edit > Undo), which won't work.
   *   - "I am sorry to say that there is no solution and this is just what webdev is like."
   *   - tru chainz
   */
  class MiniEditUndoPlugin {
    public editor: MiniEdit;
    public undoIndex?: number = null;
    public ignoreInput = false;
    public history: {
      text: string;
      selection: MiniEditSelection;
    }[] = [];

    public onPushHistory: (text: string, selection: MiniEditSelection) => void;
    public onKeyDown: (event: KeyboardEvent) => void;

    public constructor(editor: MiniEdit);
  }
}
