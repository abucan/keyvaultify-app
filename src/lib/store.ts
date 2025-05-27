type SecretEntry = {
  projectId: string;
  environment: string;
  encryptedSecrets: Record<string, string>;
};

const store = new Map<string, SecretEntry>();

export function saveSecrets(
  projectId: string,
  environment: string,
  secrets: Record<string, string>
) {
  const key = `${projectId}:${environment}`;
  store.set(key, { projectId, environment, encryptedSecrets: secrets });
}

export function getSecrets(projectId: string, environment: string) {
  const key = `${projectId}:${environment}`;
  return store.get(key) || null;
}
