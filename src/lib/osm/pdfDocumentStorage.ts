type RememberedPDF = { file: Blob; name: string };
let connection: Promise<IDBDatabase> | undefined;

function database() {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("breathe4school-osm", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("documents");
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Close other workspace tabs and try again."));
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); connection = undefined; };
        resolve(db);
      };
    }).catch(error => { connection = undefined; throw error; });
  }
  return connection;
}

async function transact<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await database();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction("documents", mode);
    const request = action(transaction.objectStore("documents"));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error("Device storage is unavailable."));
  });
}

export async function readRememberedPDF(): Promise<RememberedPDF | null> {
  const value = await transact<RememberedPDF | undefined>("readonly", store => store.get("last-opened"));
  return value?.file instanceof Blob && typeof value.name === "string" ? value : null;
}
export async function rememberPDF(file: Blob, name: string) {
  await transact("readwrite", store => store.put({ file, name }, "last-opened"));
}
export async function forgetPDF() {
  await transact("readwrite", store => store.delete("last-opened"));
}
