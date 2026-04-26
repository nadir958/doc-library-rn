module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated plugin (miroir de la config standard)
      // En v4, ce plugin requiert 'react-native-worklets/plugin'
      'react-native-reanimated/plugin',
    ],
  };
};
