/**
 * @file `scss.d.ts` - Typings for importing SCSS Modules.
 * @author Keith Choison <keith@tize.io>
 * @since 0.1.0
 */

declare module '*.module.scss' {
  const styles: { [className: string]: string; };

  export default styles;
}
