import * as React from 'react';
import {
  PageSection,
  Button,
  EmptyState,
  EmptyStateBody
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

const NotFound: React.FunctionComponent = () => {
  function GoHomeBtn() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return (
      <Button onClick={handleClick}>Take me home</Button>
    );
  }

  return (
    <PageSection>
    <EmptyState variant="full">
      <EmptyStateBody>
        We didn&apos;t find a page that matches the address you navigated to.
      </EmptyStateBody>
      <GoHomeBtn />
      </EmptyState>
  </PageSection>
  )
};

export { NotFound };
