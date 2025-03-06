import jwt from 'jsonwebtoken';

interface SaveQueryRequest {
  email: string;
  frequency: string;
  filter_data: Array<{
    operation: string;
    field: string;
    value: string | number;
  }>;
}

const GHOST_API_URL = 'https://wheelstrategyoptions.com/blog/ghost/api/v3/admin/';
const GHOST_ADMIN_API_KEY = '67c4d7a9e5628600013e3c70:ed54d03c0aad9d32f4f5ad091343afa5f3686021263e4e7acbb065ec45095ab8';

export const subscribeToGhost = async (email: string, name?: string) => {
  try {
    const [id, secret] = GHOST_ADMIN_API_KEY.split(':');
    
    // Convert hex to Buffer for proper JWT signing
    const secretBuffer = Buffer.from(secret, 'hex');
    
    // Create JWT token with proper secret format
    const token = jwt.sign({}, secretBuffer, {
      keyid: id,
      algorithm: 'HS256',
      expiresIn: '5m',
      audience: '/v3/admin/'
    });
    
    const response = await fetch(`${GHOST_API_URL}members/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Ghost ${token}`
      },
      body: JSON.stringify({
        members: [{
          email,
          name: name || '',
          labels: [],
          subscribed: true,
          email_type: 'html',
          newsletters: [{
            id: '67966030c7996a000117be50',
            name: 'Wheel Strategy Options Newsletter'
          }]
        }]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || 'Failed to subscribe');
    }

    return response.json();
  } catch (error) {
    console.error('Ghost subscription error:', error);
    throw new Error('Failed to subscribe to newsletter');
  }
};

export const saveQuery = async (data: SaveQueryRequest) => {
  const response = await fetch('https://api.wheelstrategyoptions.com/wheelstrat/saveQuery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save query');
  }

  return response.json();
};