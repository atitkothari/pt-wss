import { GET } from '../route';

global.fetch = jest.fn();

describe('Options API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch options for a given symbol', async () => {
    const mockOptions = { options: [{ symbol: 'AAPL' }] };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOptions),
    });

    const request = new Request('http://localhost/api/options?symbol=AAPL');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockOptions);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.wheelstrategyoptions.com/wheelstrat/filter',
      expect.any(Object)
    );
  });

  it('should return an error if symbol is not provided', async () => {
    const request = new Request('http://localhost/api/options');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Symbol is required' });
  });
});
