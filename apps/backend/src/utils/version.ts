export function isAboveVersion(version: string, minVersion: string): boolean {
  const [major, minor, patch] = version.split('.');
  const [minMajor, minMinor, minPatch] = minVersion.split('.');

  if (major > minMajor) {
    return true;
  }
  if (major < minMajor) {
    return false;
  }

  if (minor > minMinor) {
    return true;
  }
  if (minor < minMinor) {
    return false;
  }

  if (patch > minPatch) {
    return true;
  }
  if (patch < minPatch) {
    return false;
  }

  return false;
}

export function isBelowVersion(version: string, maxVersion: string): boolean {
  const [major, minor, patch] = version.split('.');
  const [maxMajor, maxMinor, maxPatch] = maxVersion.split('.');

  if (major < maxMajor) {
    return true;
  }
  if (major > maxMajor) {
    return false;
  }

  if (minor < maxMinor) {
    return true;
  }
  if (minor > maxMinor) {
    return false;
  }

  if (patch < maxPatch) {
    return true;
  }
  if (patch > maxPatch) {
    return false;
  }

  return false;
}
