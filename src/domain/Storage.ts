// Storage service. Right now: LocalStorage

class StorageService {
  public set(key: string, value: string) {
    localStorage.setItem(key, value)
  }

  public get(key: string): string | null {
    return localStorage.getItem(key)
  }
}

export const StorageServiceInstance = new StorageService()
