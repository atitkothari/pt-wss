interface Window {
  plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
} 