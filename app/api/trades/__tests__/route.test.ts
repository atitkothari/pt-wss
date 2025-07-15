import { GET, POST, PUT } from '../route';
import { db } from '@/app/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

jest.mock('@/app/lib/firebase-admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn(),
  },
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('Trades API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should fetch trades for the current user', async () => {
      const mockTrades = [{ id: '1', symbol: 'AAPL' }];
      (db.collection('trades').where().get as jest.Mock).mockResolvedValue({
        docs: mockTrades.map(trade => ({ id: trade.id, data: () => trade })),
      });
      (getAuth().verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-user' });

      const request = new Request('http://localhost/api/trades', {
        headers: { Authorization: 'Bearer test-token' },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTrades);
    });
  });

  describe('POST', () => {
    it('should create a new trade', async () => {
      const newTrade = { symbol: 'AAPL' };
      (db.collection('trades').add as jest.Mock).mockResolvedValue({ id: 'new-id' });
      (getAuth().verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-user' });

      const request = new Request('http://localhost/api/trades', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrade),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('new-id');
      expect(data.symbol).toBe('AAPL');
    });
  });

  describe('PUT', () => {
    it('should update an existing trade', async () => {
      const updatedTrade = { id: '1', status: 'closed' };
      (getAuth().verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-user' });

      const request = new Request('http://localhost/api/trades', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTrade),
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(db.collection('trades').doc).toHaveBeenCalledWith('1');
      expect(db.collection('trades').doc().update).toHaveBeenCalledWith({ status: 'closed' });
      expect(data).toEqual(updatedTrade);
    });
  });
});
