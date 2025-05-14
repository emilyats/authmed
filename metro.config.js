const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  config.resolver.sourceExts.push('cjs');

  config.resolver.unstable_enablePackageExports = false;

  config.resolver.unstable_enableSymlinks = false;

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer")
  };
  config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts.filter((ext) => ext !== "svg"), "bin"],
    sourceExts: [...resolver.sourceExts, "svg"]
  };

  return config;
})();