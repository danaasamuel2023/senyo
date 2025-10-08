// Console error suppression for common development warnings
// This helps clean up the console during development

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Suppress common React development warnings
  const suppressedErrors = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: componentWillReceiveProps has been renamed',
    'Warning: componentWillMount has been renamed',
    'Warning: componentWillUpdate has been renamed',
    'Warning: findDOMNode is deprecated',
    'Warning: Each child in a list should have a unique "key" prop',
    'Warning: validateDOMNesting',
    'Warning: React does not recognize the',
    'Warning: Unknown event handler property',
    'Warning: Received `true` for a non-boolean attribute',
    'Warning: The tag <',
    'Warning: React DevTools',
    'Warning: Fast Refresh',
    'Warning: webpack',
    'Warning: hot-update',
    'Warning: DevTools',
    'Warning: .well-known',
    'Warning: devIndicators',
    'Warning: buildActivity',
    'Warning: buildActivityPosition',
    'Warning: deprecated',
    'Warning: has been renamed',
    'Warning: conflicts with',
    'Warning: Cannot update a component',
    'Warning: Can\'t perform a React state update',
    'Warning: Maximum update depth exceeded',
    'Warning: setState(...): Can only update a mounted component',
    'Warning: Can\'t call setState on an unmounted component',
    'Warning: component is changing an uncontrolled input',
    'Warning: component is changing a controlled input',
    'Warning: A component is changing an uncontrolled input',
    'Warning: A component is changing a controlled input',
    'Warning: Input elements should not switch from uncontrolled to controlled',
    'Warning: Input elements should not switch from controlled to uncontrolled',
    'Warning: Each child in a list should have a unique "key" prop',
    'Warning: validateDOMNesting',
    'Warning: React does not recognize the',
    'Warning: Unknown event handler property',
    'Warning: Received `true` for a non-boolean attribute',
    'Warning: The tag <',
    'Warning: React DevTools',
    'Warning: Fast Refresh',
    'Warning: webpack',
    'Warning: hot-update',
    'Warning: DevTools',
    'Warning: .well-known',
    'Warning: devIndicators',
    'Warning: buildActivity',
    'Warning: buildActivityPosition',
    'Warning: deprecated',
    'Warning: has been renamed',
    'Warning: conflicts with'
  ];

  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: componentWillReceiveProps has been renamed',
    'Warning: componentWillMount has been renamed',
    'Warning: componentWillUpdate has been renamed',
    'Warning: findDOMNode is deprecated',
    'Warning: Each child in a list should have a unique "key" prop',
    'Warning: validateDOMNesting',
    'Warning: React does not recognize the',
    'Warning: Unknown event handler property',
    'Warning: Received `true` for a non-boolean attribute',
    'Warning: The tag <',
    'Warning: React DevTools',
    'Warning: Fast Refresh',
    'Warning: webpack',
    'Warning: hot-update',
    'Warning: DevTools',
    'Warning: .well-known',
    'Warning: devIndicators',
    'Warning: buildActivity',
    'Warning: buildActivityPosition',
    'Warning: deprecated',
    'Warning: has been renamed',
    'Warning: conflicts with'
  ];

  // Override console.error
  console.error = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressedErrors.some(suppressed => 
      message.includes(suppressed)
    );
    
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressedWarnings.some(suppressed => 
      message.includes(suppressed)
    );
    
    if (!shouldSuppress) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // Log that error suppression is active
  console.log('🔇 Console error suppression active for development');
}

// Export for manual use if needed
export const suppressConsoleErrors = () => {
  // Already handled above
};

export const restoreConsoleErrors = () => {
  if (typeof window !== 'undefined') {
    // Restore original console methods if needed
    console.error = window.originalConsoleError || console.error;
    console.warn = window.originalConsoleWarn || console.warn;
  }
};
