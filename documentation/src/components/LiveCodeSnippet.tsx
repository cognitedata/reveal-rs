import * as React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { PrismTheme } from 'prism-react-renderer';
import clsx from 'clsx';

import styles from './styles.module.css';
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
import { customScope } from './customScope';
const defaultCodeTheme = oceanicNext;

export type LiveCodeSnippetProps = {
  children: string;
  theme: PrismTheme;
  transformCode: (code: string) => string;
  props: any;
};

const prependedCode =  `
  const viewer = window.viewer;
  const model = window.model;
  const sdk = window.sdk;
  if (viewer) resetViewerEventHandlers(viewer);
  const viewerEl = document.getElementById('demo-wrapper');
  if (viewerEl) viewerEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  // User code starts here!
`

export class LiveCodeSnippet extends React.Component<LiveCodeSnippetProps> {
  constructor(props: LiveCodeSnippetProps) {
    super(props);
  }

  render() {
    const { transformCode, children, theme, props } = this.props;
    return (
      <LiveProvider
        code={children}
        transformCode={(code) => {
          const fullCode = `
            ${prependedCode}
            // User code starts here!
            ${transformCode ? transformCode(code) : code}`;

          return `<button onClick={() => \{${fullCode}\}}>Run</button>`;
        }}
        scope={{ ...customScope }}
        theme={theme || defaultCodeTheme}
        {...props}
      >
        <div
          className={clsx(
            styles.codeSnippetHeader,
            styles.codeSnippetEditorHeader
          )}
        >
          Live Editor
        </div>
        <LiveEditor className={styles.codeSnippetEditor} />
        <div className={styles.codeSnippetPreview}>
          <LivePreview />
          <LiveError />
        </div>
      </LiveProvider>
    );
  }
}
