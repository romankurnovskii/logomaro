/**
 * @file App.tsx
 * @description Root application component — renders the AppContainer.
 *
 * @features
 * - Thin wrapper that delegates to AppContainer
 * - No business logic, no state — pure composition
 */
import { AppContainer } from './containers/AppContainer';

export const App = () => <AppContainer />;
