import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import * as Dompurify from 'dompurify'

const sanitizer = Dompurify.sanitize;
import Processor, { Asciidoctor } from 'asciidoctor';

const asciidoctor_options = {
  to_file: false,
  standalone: true,
  backend: "html5"
};

processor : Asciidoctor;
const processor = Processor();

let content = `
= Test Document

== This is a test
`;

let html = processor.convertFile(content , asciidoctor_options);
console.log(html);

let Documentation: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Documentation</Title>
    <div dangerouslySetInnerHTML={{__html: sanitizer(html)}} />
  </PageSection>
)

export { Documentation };