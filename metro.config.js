const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Stub out modules that have no web implementation.
// react-native-worklets-core / react-native-worklets are used by
// react-native-reanimated v4 internally. They rely on JSI / native threads
// that don't exist in a browser — Metro would fail trying to bundle them.
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

module.exports = withNativeWind(config, { input: './global.css' });
