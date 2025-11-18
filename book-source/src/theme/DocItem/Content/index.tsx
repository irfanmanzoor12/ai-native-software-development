import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import ContentModeToggle from '@site/src/components/ContentModeToggle';
import { useLocation } from '@docusaurus/router';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
  const location = useLocation();

  // Show toggle only on documentation pages (not on home, blog, etc.)
  const shouldShowToggle = location.pathname.startsWith('/docs/');

  return (
    <>
      {shouldShowToggle && (
        <ContentModeToggle />
      )}
      <Content {...props} />
    </>
  );
}
