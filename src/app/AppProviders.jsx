import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalLLMProvider } from '../features/ai/providers/LocalLLMProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalLLMProvider>{children}</LocalLLMProvider>
    </QueryClientProvider>
  );
}