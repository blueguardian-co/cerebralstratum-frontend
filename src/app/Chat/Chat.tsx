import * as React from 'react';
import { PageSection, Title, TextContent, Text, TextVariants } from '@patternfly/react-core';

const Chat: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Tracker Chat</Title>
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

export { Chat };
