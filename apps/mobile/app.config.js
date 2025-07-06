const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.zgort.ai-agent.dev";
  }

  if (IS_PREVIEW) {
    return "com.zgort.ai-agent.preview";
  }

  return "com.zgort.ai-agent";
};

const getAppName = () => {
  if (IS_DEV) {
    return "AI Agent (Dev)";
  }

  if (IS_PREVIEW) {
    return "AI Agent (Preview)";
  }

  return "AI Agent";
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});
