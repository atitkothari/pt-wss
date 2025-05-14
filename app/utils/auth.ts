import crypto from 'crypto';

export function calculateHash(epoch: number, secretKey: string): string {
    // console.log(epoch)
  const data = String(epoch) + secretKey;
  const hash = crypto.createHash('sha256').update(data, 'utf-8').digest('hex');
  return hash;
}

export function generateAuthToken(): string {
    // console.log("generateAuthTocken")
  const epoch = Math.floor(Date.now() / 1000);
  const secretKey = process.env.NEXT_PUBLIC_API_SECRET_KEY || '';
  if (!secretKey) {
    // throw new Error('API_SECRET_KEY is not defined in environment variables');
    console.log('API_SECRET_KEY is not defined in environment variables')
  }
  return calculateHash(epoch, secretKey);
} 