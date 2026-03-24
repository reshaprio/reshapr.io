/**
 * Swizzled from @docusaurus/theme-classic — copy feedback stays visible after click
 * (default theme tied full opacity to :hover on the code block, so the check vanished).
 */

import React, {useCallback, useState, useRef, useEffect} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import Button from '@theme/CodeBlock/Buttons/Button';
import IconCopy from '@theme/Icon/Copy';
import IconSuccess from '@theme/Icon/Success';

import styles from './styles.module.css';

const COPIED_RESET_MS = 2000;

function title() {
  return translate({
    id: 'theme.CodeBlock.copy',
    message: 'Copy',
    description: 'The copy button label on code blocks',
  });
}

function copiedTitle() {
  return translate({
    id: 'theme.CodeBlock.copied',
    message: 'Copied',
    description: 'The copied button label on code blocks',
  });
}

function ariaLabel(isCopied) {
  return isCopied
    ? copiedTitle()
    : translate({
        id: 'theme.CodeBlock.copyButtonAriaLabel',
        message: 'Copy code to clipboard',
        description: 'The ARIA label for copy code blocks button',
      });
}

function useCopyButton() {
  const {
    metadata: {code},
  } = useCodeBlockContext();
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef(undefined);

  const copyCode = useCallback(() => {
    if (!navigator.clipboard?.writeText) {
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      window.clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(() => {
        setIsCopied(false);
      }, COPIED_RESET_MS);
    });
  }, [code]);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  return {copyCode, isCopied};
}

export default function CopyButton({className}) {
  const {copyCode, isCopied} = useCopyButton();

  return (
    <Button
      aria-label={ariaLabel(isCopied)}
      title={isCopied ? copiedTitle() : title()}
      className={clsx(
        className,
        styles.copyButton,
        isCopied && styles.copyButtonCopied,
      )}
      onClick={copyCode}>
      <span className={styles.copyButtonIcons} aria-hidden="true">
        <IconCopy className={styles.copyButtonIcon} />
        <IconSuccess className={styles.copyButtonSuccessIcon} />
      </span>
      {isCopied ? (
        <span className={styles.copiedLabel}>{copiedTitle()}</span>
      ) : null}
    </Button>
  );
}
