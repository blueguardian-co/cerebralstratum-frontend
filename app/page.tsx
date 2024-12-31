'use client'

import React from 'react';
import {
    Toolbar,
    ToolbarContent,
    ToolbarItem,
    SearchInput,
    PageSection
} from '@patternfly/react-core';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  return (
      <>
          <PageSection isFilled={true}>
              <Toolbar id="device-toolbar">
                  <ToolbarContent>
                      <ToolbarItem>
                          <SearchInput placeholder="Filter by device name" />
                      </ToolbarItem>
                  </ToolbarContent>
              </Toolbar>
              <DynamicMap latitude={-35.44665} longitude={149.09108} zoom={16}/>
          </PageSection>
      </>
  );
}
