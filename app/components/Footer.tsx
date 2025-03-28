"use client";

import Link from "next/link";

export function Footer() {
  const navigation = {
    screeners: [
      { name: 'Covered Call Screener', href: '/covered-call-screener' },
      { name: 'Cash Secured Put Screener', href: '/cash-secured-put-screener' },
    ],
    tools: [
      { name: 'Discover', href: '/discover' },
      { name: 'Covered Call Calculator', href: '/covered-call-calculator' },
    ],
    resources: [
      { name: 'Blog', href: 'https://wheelstrategyoptions.com/blog/', external: true },
      { name: 'API', href: 'https://forms.gle/FRLem4M35jQV3W7Z6', external: true },
      { name: 'Privacy Policy', href: 'https://wheelstrategyoptions.com/blog/privacy-policy-for-wheel-strategy-options/', external: true },
      { name: 'Terms of Service', href: 'https://wheelstrategyoptions.com/blog/terms-of-service-for-wheel-strategy-options/', external: true },
    ],
  };

  return (
    <footer className="mt-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Screeners */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Screeners</h3>
            <ul className="space-y-2">
              {navigation.screeners.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tools</h3>
            <ul className="space-y-2">
              {navigation.tools.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4">
          <p className="text-xs text-gray-600">
            The data returned by this free screener is for information and educational purposes only. 
            It is not a recommendation to buy or sell a security. All investors should consult a qualified 
            professional before trading in any security. Stock and option trading involves risk and is not 
            suitable for all investors.
          </p>
        </div>
      </div>
    </footer>
  );
}