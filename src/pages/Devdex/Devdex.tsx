/**
 * @file `Devdex.tsx`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

import * as React from 'react';
import cx from 'classnames';
import { BuildInfo } from '@showdex/components/debug';
import { TextField } from '@showdex/components/form';
import { Card, PageContainer } from '@showdex/components/layout';
import { BaseButton, ToggleButton, Tooltip } from '@showdex/components/ui';
import { boundedStringify } from '@showdex/utils/core/safeStringify';
import { type LoggerLevel, LoggerLevelValues, teledex } from '@showdex/utils/debug';
import styles from './Devdex.module.scss';

export interface DevdexProps {
  onLeaveRoom?: () => void;
}

const l = { scope: '@showdex/pages/Devdex' };

/**
 * Devdex-only "funny" level labels — restoring the vibe of Keith's old `logger.ts`.
 *
 * @since 1.2.5
 */
const LevelLabels: Record<LoggerLevel, string> = {
  silly: 'SILL',
  debug: 'DBUG',
  verbose: 'VERB',
  info: 'INFO',
  success: 'GUCC',
  warn: 'SHIT',
  error: 'FUCK',
};

// scopes are all `@showdex/…`, so truncate the *start* (keep the meaningful tail) to a fixed monospace width
const ScopeMaxChars = 24;

// msgs longer than this get a click-to-expand toggle (collapsed = single truncated line)
const ExpandThreshold = 120;

const truncateStart = (value: string, max: number) => (
  value.length > max ? `…${value.slice(-(max - 1))}` : value
);

export const Devdex = ({
  onLeaveRoom,
}: DevdexProps): React.JSX.Element => {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  const [minLevel] = React.useState<LoggerLevel>('debug');
  const [scope, setScope] = React.useState('');
  const [text, setText] = React.useState('');
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const [atTop, setAtTop] = React.useState(true);
  const [atBottom, setAtBottom] = React.useState(true);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stick = React.useRef(true); // pinned to the bottom (tail-follow)

  // throttle re-renders: a live battle fires hundreds of logs/sec — re-rendering per capture freezes the
  // panel, so coalesce a burst into at most one render per ~250ms (plenty for a human-readable tail)
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> = null;

    const unsubscribe = teledex.subscribe(() => {
      if (timer) {
        return;
      }

      timer = setTimeout(() => {
        timer = null;
        force();
      }, 250);
    });

    return () => {
      if (timer) {
        clearTimeout(timer);
      }

      unsubscribe();
    };
  }, []);

  // only render the live tail (the full history is always in a flush) — keeps the DOM + reconciliation cheap.
  // the limit (200) is pushed into filter() so a text search only stringifies the matching tail, not all 5000
  const rows = teledex.filter({ level: LoggerLevelValues[minLevel], scope, text }, 200);

  // attach a scroll listener to the (SimpleBar) scroll element once it's mounted
  React.useEffect(() => {
    let raf: number;
    let el: HTMLDivElement;

    const onScroll = () => {
      if (!el) {
        return;
      }

      const top = el.scrollTop <= 8;
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;

      stick.current = bottom;
      setAtTop(top);
      setAtBottom(bottom);
    };

    const attach = () => {
      el = scrollRef.current;

      if (!el) {
        raf = requestAnimationFrame(attach);

        return;
      }

      el.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    };

    attach();

    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener('scroll', onScroll);
    };
  }, []);

  // auto-scroll to the bottom when new rows arrive & we're already pinned there
  React.useEffect(() => {
    if (stick.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rows.length]);

  const scrollTo = (to: 'top' | 'bottom') => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    // set stick SYNCHRONOUSLY (before the async 'scroll' event updates it) so a streaming log's
    // auto-scroll-to-bottom effect doesn't instantly undo a scroll-to-top
    stick.current = to === 'bottom';
    el.scrollTo({ top: to === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' });
  };

  const toggleExpand = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    return next;
  });

  return (
    <PageContainer
      name="devdex"
      className={styles.container}
      contentClassName={styles.content}
      contentStyle={{ padding: 0 }}
      prefix={<BuildInfo className={styles.buildInfo} position="top-right" />}
      suffix={(
        <div className={styles.fabs}>
          {!atTop && (
            // display="block" -> renders a <div role="button">, NOT a real <button> (PS's client intercepts
            // <button> clicks via dispatchClickButton() + stopImmediatePropagation(), which would eat onPress)
            <BaseButton
              display="block"
              className={styles.fab}
              aria-label="Scroll to top"
              onPress={() => scrollTo('top')}
            >
              <i className="fa fa-chevron-up" />
            </BaseButton>
          )}

          {!atBottom && (
            <BaseButton
              display="block"
              className={styles.fab}
              aria-label="Scroll to bottom"
              onPress={() => scrollTo('bottom')}
            >
              <i className="fa fa-chevron-down" />
            </BaseButton>
          )}
        </div>
      )}
    >
      <Card className={styles.toolbar}>
        <div className={styles.filters}>
          <TextField
            hint="scope…"
            meta={{}}
            input={{
              name: `${l.scope}:Scope`,
              value: scope,
              onChange: (value: string) => setScope(value),
              onBlur: () => void 0,
              onFocus: () => void 0,
            }}
          />

          <TextField
            hint="text…"
            meta={{}}
            input={{
              name: `${l.scope}:Text`,
              value: text,
              onChange: (value: string) => setText(value),
              onBlur: () => void 0,
              onFocus: () => void 0,
            }}
          />
        </div>

        <div className={styles.actions}>
          <ToggleButton
            className={styles.actionButton}
            label="Flush"
            absoluteHover
            onPress={() => void teledex.flush({ to: 'file' })}
          />

          <ToggleButton
            className={styles.actionButton}
            label="Copy"
            absoluteHover
            onPress={() => void teledex.flush({ to: 'clipboard' })}
          />

          <ToggleButton
            className={styles.actionButton}
            label="Clear"
            absoluteHover
            onPress={() => void teledex.clear()}
          />

          <ToggleButton
            className={styles.actionButton}
            absoluteHover
            onPress={onLeaveRoom}
          >
            <i className="fa fa-close" />
            <span>Close</span>
          </ToggleButton>
        </div>
      </Card>

      <div ref={scrollRef} className={styles.log}>
        {rows.map((r) => {
          // bounded preview per arg — a live battle logs huge/circular Showdown objects; serializing them
          // unbounded OOM-crashes the tab, so cap each to ~2KB / depth 8
          const msg = r.args.map((a) => (typeof a === 'string' ? a : boundedStringify(a, 2_000, 8))).join(' ');
          const expandable = msg.length > ExpandThreshold;
          const open = expanded.has(r.id);
          const shortScope = truncateStart(r.scope, ScopeMaxChars);

          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div
              key={r.id}
              className={cx(
                styles.row,
                styles[r.level],
                expandable && styles.expandable,
                open && styles.open,
              )}
              onClick={expandable ? () => toggleExpand(r.id) : undefined}
            >
              <span className={styles.ts}>{new Date(r.ts).toLocaleTimeString()}</span>
              <span className={styles.level}>{LevelLabels[r.level] || r.level}</span>
              {shortScope === r.scope ? (
                <span className={styles.scope}>{shortScope}</span>
              ) : (
                <Tooltip content={r.scope}>
                  <span className={styles.scope}>{shortScope}</span>
                </Tooltip>
              )}
              <span className={styles.msg}>{msg}</span>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};
