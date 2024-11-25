import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create the query client with default options
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

// Wrapper component to wrap the test UI in QueryClientProvider
const Wrapper = ({ children }: { children: ReactElement }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

// Custom render function for testing
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) =>
  render(ui, {
    wrapper: Wrapper as React.ComponentType,
    ...options,
  })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render }
