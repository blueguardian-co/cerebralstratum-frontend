import * as React from 'react';
import { PageSection, Title, TextContent, Text, TextVariants } from '@patternfly/react-core';

const Dashboard: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Tracker Dashboard</Title>
    <TextContent>
      <Text component={TextVariants.p}>
        Hello World!
      </Text>
      <Text component={TextVariants.p}>
        This is a new paragraph.
      </Text>
    </TextContent>
  </PageSection>
)

export { Dashboard };
