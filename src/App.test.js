import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const fiexedElement = screen.getByText(/Current exchange Rate/i);
  expect(fiexedElement).toBeInTheDocument();
});
