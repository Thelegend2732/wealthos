module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // babel-preset-expo handles JSX, TypeScript and platform-specific
      // transforms. No extra plugins needed:
      //
      // • nativewind/babel is intentionally removed — in NativeWind v4.x
      //   the package exports { plugins:[...] } (preset format) rather than
      //   a plugin factory, which causes Babel to throw
      //   ".plugins is not a valid Plugin property". Additionally, that
      //   plugin is only needed when using className="..." JSX props; our
      //   codebase uses StyleSheet.create() exclusively, so it is a no-op.
      //
      // • react-native-reanimated/plugin is intentionally removed — in
      //   Reanimated v4 the old plugin also returns an invalid structure.
      //   We don't use any Reanimated hooks directly.
      //
      // CSS processing (Tailwind) is handled by metro.config.js via
      // withNativeWind — that is independent of Babel.
      'babel-preset-expo',
    ],
  };
};
