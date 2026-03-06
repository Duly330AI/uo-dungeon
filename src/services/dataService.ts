export async function loadData<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load data from ${path}: ${response.statusText}`);
  }
  return response.json();
}
