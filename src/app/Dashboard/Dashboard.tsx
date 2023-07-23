import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { BannerStatus } from '../Banner/Banner';

const Dashboard: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Devices</Title>
    <BannerStatus />
  </PageSection>
)

export { Dashboard };
