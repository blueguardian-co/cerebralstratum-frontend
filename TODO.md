# TODO List

Fix:

## ./app/components/SSEClient.tsx
- [X] 3:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
- [X] 16:21  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment

## ./app/containers/DeviceFilter.tsx
- [X] 39:13  Error: 'isAuthenticated' is assigned a value but never used.  @typescript-eslint/no-unused-vars
- [X] 57:25  Error: 'setPlaceholder' is assigned a value but never used.  @typescript-eslint/no-unused-vars
- [X] 64:40  Error: 'fetchDevices' is assigned a value but never used.  @typescript-eslint/no-unused-vars
- [X] 133:8  Warning: React Hook useEffect has missing dependencies: 'error', 'initialSelectOptions', and 'isOpen'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
- [X] 135:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
- [X] 243:13  Warning: Unused eslint-disable directive (no problems were reported from 'no-console').
- [X] 306:21  Error: Expected an assignment or function call and instead saw an expression.  @typescript-eslint/no-unused-expressions

## ./app/layout.tsx
- [X] 18:40  Error: 'event' is defined but never used.  @typescript-eslint/no-unused-vars
- [X] 18:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
- [X] 21:25  Error: 'setUserProfile' is assigned a value but never used.  @typescript-eslint/no-unused-vars
- [X] 127:8  Warning: React Hook React.useEffect has a missing dependency: 'subscriptionNotifications'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

## ./app/page.tsx
- [X] 64:44  Error: 'fetchDevices' is assigned a value but never used.  @typescript-eslint/no-unused-vars
- [X] 64:61  Error: React Hook "useMyDevices" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks

## ./app/providers/AuthProvider.tsx
- [X] 2:1  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
- [X] 64:13  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
- [X] 121:18  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
- [X] 169:8  Warning: React Hook useEffect has missing dependencies: 'initKeycloak' and 'refreshToken'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

## ./app/providers/MyDevices.tsx
- [X] 58:8  Warning: React Hook useEffect has a missing dependency: 'fetchDevices'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

## ./app/services/BackendNotifications.tsx
- [X] 1:8  Error: 'React' is defined but never used.  @typescript-eslint/no-unused-vars
- [X] 5:6  Error: 'BackendNotification' is defined but never used.  @typescript-eslint/no-unused-vars
- [X] 79:8  Warning: React Hook useEffect has a missing dependency: 'backendNotifications'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

## ./app/services/SubscriptionNotifications.tsx
- [X] 1:8  Error: 'React' is defined but never used.  @typescript-eslint/no-unused-vars
- [X] 39:8  Warning: React Hook useEffect has missing dependencies: 'subscriptionNotifications', 'userProfile.subscription_entitlement', and 'userProfile.subscription_used'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps