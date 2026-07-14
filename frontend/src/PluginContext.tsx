import { createContext, useContext } from 'react';

export const PluginContext = createContext<{ activePlugins: string[] }>({ activePlugins: [] });

export function usePluginContext() {
  return useContext(PluginContext);
}
