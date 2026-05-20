const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub modules that have no web implementation so Metro doesn't crash
// when bundling for web. react-native-worklets-core is used internally
// by react-native-reanimated v4 on native only (JSI threads); the web
// build of reanimated uses CSS/JS animations without worklets.
const WEB_STUB_MODULES = new Set([
  'react-native-worklets-core',
  'react-native-worklets',
]);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const base = moduleName.split('/')[0];
    if (WEB_STUB_MODULES.has(base)) {
      return { type: 'empty' };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
