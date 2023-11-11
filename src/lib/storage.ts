const inMemoryStorage: Storage = (() => {
  const map = new Map<string, string>()

  const setItem = (key: string, value: string) => {
    map.set(key, value)
    storage.length = map.size
  }

  const removeItem = (key: string) => {
    map.delete(key)
    storage.length = map.size
  }

  const getItem = (key: string): string | null => {
    return map.get(key) ?? null
  }

  const clear = () => {
    map.clear()
    storage.length = 0
  }

  const key = (index: number): string | null => {
    return Array.from(map.keys())[index] ?? null
  }

  const storage = {
    setItem,
    removeItem,
    getItem,
    clear,
    key,
    length: 0,
  }

  return storage
})()

interface GetValueFromStorageProps<T> {
  storage: Storage
  key: string
  defaultValue: T
}

export function getValueFromStorage<T>({
  storage,
  key,
  defaultValue,
}: GetValueFromStorageProps<T>): T {
  try {
    // In case the storage object is invalid, let's use in memory storage.
    const normalizedStorage =
      (storage as Storage | undefined) ?? inMemoryStorage
    const unparsedMap = normalizedStorage.getItem(key)

    if (typeof unparsedMap === "string") {
      return JSON.parse(unparsedMap)
    }

    return defaultValue
  } catch (e) {
    console.error(e)

    return defaultValue
  }
}

interface SetValueInStorageProps<T> {
  storage: Storage
  key: string
  defaultValue: T
  updateFn: (oldValue: T) => T
}

export function setValueInStorage<T>({
  storage,
  key,
  defaultValue,
  updateFn,
}: SetValueInStorageProps<T>) {
  // In case the storage object is invalid, let's use in memory storage.
  const normalizedStorage = (storage as Storage | undefined) ?? inMemoryStorage
  const oldValue = getValueFromStorage({
    storage: normalizedStorage,
    key,
    defaultValue,
  })
  const newValue = updateFn(oldValue)

  normalizedStorage.setItem(key, JSON.stringify(newValue))
}
