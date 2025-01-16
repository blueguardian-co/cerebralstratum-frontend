'use client'

import React, { useContext, useEffect } from 'react';
import {
    PageSection
} from '@patternfly/react-core';
import dynamic from 'next/dynamic';
import { useAuth } from "./components/AuthProvider";

const DynamicMap = dynamic(() => import('./components/Map'), { ssr: false });

/* TODO:
 1. Remove PageSidebar (possibly add back in later)
 2. Add `Register Device` button in Toolbar
 3. Add `Drawer`
 4. Add `NotifcationDrawer`
 5. Add Dark Mode
 6. Reduce/remove padding for `Map` in `Page`

 Misc:
 - Create CEREBRAL STRATUM logo
 - Create BlueGuardian Co logo
 - Use `Tooltip` for tool tips
*/

export default function Home() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return (
            <>
                <PageSection isFilled={true}>
                    <DynamicMap latitude={-35.44665} longitude={149.09108} zoom={16}/>
                </PageSection>
            </>
        )
    }
  return (
      <>
          <PageSection isFilled={true}>
              <DynamicMap latitude={-35.44665} longitude={149.09108} zoom={16}/>
          </PageSection>
      </>
  );
}
