import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
const asciidoctor = require('@asciidoctor/core')();

const asciidoctor_options = {
  to_file: false,
  standalone: true,
  base_dir: "@app/Documentation/adoc",
  backend: "html5"
};

let content = "= Test Document"
let html = asciidoctor.convert(content, asciidoctor_options);

let Documentation: React.FunctionComponent = () => (
    <PageSection>
      <Title headingLevel="h1" size="lg">Documentation</Title>
      {html}
    </PageSection>
)

export { Documentation };