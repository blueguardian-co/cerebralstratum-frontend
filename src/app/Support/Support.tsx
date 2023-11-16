import * as React from 'react';
import {
  PageSection,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';

export interface ISupportProps {
  sampleProp?: string;
}

// eslint-disable-next-line prefer-const
let Support: React.FunctionComponent<ISupportProps> = () => (
  <PageSection>
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateBody>
        <TextContent>
          <Text component="p">
            This represents an the empty state pattern in Patternfly 4. Hopefully it&apos;s simple enough to use but
            flexible enough to meet a variety of needs.
          </Text>
          <Text component={TextVariants.small}>
            This text has overridden a css component variable to demonstrate how to apply customizations using
            PatternFly&apos;s global variable API.
          </Text>
        </TextContent>
      </EmptyStateBody>
  </EmptyState>
  </PageSection>
);

export { Support };
