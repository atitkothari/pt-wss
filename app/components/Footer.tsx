"use client";

export function Footer() {
  return (
    <div className="mt-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
        <p>
          The data returned by this free screener is for information and educational purposes only. 
          It is not a recommendation to buy or sell a security. All investors should consult a qualified 
          professional before trading in any security. Stock and option trading involves risk and is not 
          suitable for all investors.
        </p>
        <div className="mt-2 text-center">
          <a 
            href="https://wheelstrategyoptions.com/blog/privacy-policy-for-wheel-strategy-options/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Privacy Policy
          </a>
          <span className="mx-2">|</span>
          <a 
            href="https://wheelstrategyoptions.com/blog/terms-of-service-for-wheel-strategy-options/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}