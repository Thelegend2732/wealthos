module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource tells Babel to use NativeWind's JSX runtime,
      // which handles className → StyleSheet on native and CSS on web.
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // nativewind/babel transforms the `tw` / className props for native.
      'nativewind/babel',
      // react-native-reanimated/plugin is intentionally OMITTED.
      // Reanimated v4 redesigned its plugin system; the old plugin
      // returns an object with a `plugins` key which Babel rejects as
      // ".plugins is not a valid Plugin property".
      // We don't use Reanimated's hooks directly (we use RN's Animated),
      // so this plugin is not needed.
    ],
  };
};
