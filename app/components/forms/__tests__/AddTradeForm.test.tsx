import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddTradeForm } from '../AddTradeForm';
import { useSymbols } from '@/app/hooks/useSymbols';

jest.mock('@/app/hooks/useSymbols', () => ({
  useSymbols: jest.fn(),
}));

global.fetch = jest.fn();

describe('AddTradeForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    (useSymbols as jest.Mock).mockReturnValue({
      symbols: ['AAPL', 'GOOGL', 'TSLA'],
    });
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ options: [{ id: '1', type: 'call', strike: 150, expiration: '2024-12-20', bidPrice: 2.5 }] }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form', () => {
    render(<AddTradeForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText('Stock Symbol')).toBeInTheDocument();
  });

  it('should show suggestions when typing a symbol', async () => {
    render(<AddTradeForm onSubmit={mockOnSubmit} />);
    const symbolInput = screen.getByLabelText('Stock Symbol');
    fireEvent.change(symbolInput, { target: { value: 'A' } });

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });

  it('should fetch contracts when a symbol is selected', async () => {
    render(<AddTradeForm onSubmit={mockOnSubmit} />);
    const symbolInput = screen.getByLabelText('Stock Symbol');
    fireEvent.change(symbolInput, { target: { value: 'A' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('AAPL'));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/options?symbol=AAPL');
    });
  });

  it('should submit the form with the correct data', async () => {
    render(<AddTradeForm onSubmit={mockOnSubmit} />);
    const symbolInput = screen.getByLabelText('Stock Symbol');
    fireEvent.change(symbolInput, { target: { value: 'A' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('AAPL'));
    });

    await waitFor(() => {
        fireEvent.click(screen.getByText('Select an expiration date'));
    });
    await waitFor(() => {
        fireEvent.click(screen.getByText('2024-12-20'));
    });

    await waitFor(() => {
        fireEvent.click(screen.getByText('Select a strike price'));
    });
    await waitFor(() => {
        fireEvent.click(screen.getByText('150'));
    });

    const premiumInput = screen.getByLabelText('Premium');
    fireEvent.change(premiumInput, { target: { value: '250' } });

    fireEvent.click(screen.getByText('Add Trade'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        symbol: 'AAPL',
        type: 'call',
        strike: 150,
        expiration: '2024-12-20',
        premium: 250,
      });
    });
  });
});
