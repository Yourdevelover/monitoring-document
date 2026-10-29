const pendingFileTasks = new Map<string, Promise<void>>();

export async function enqueueFileTask<T>(task: () => Promise<T>, key = "global"): Promise<T> {
  const previousTask = pendingFileTasks.get(key) ?? Promise.resolve();

  let releaseTask: () => void;

  const currentTask = new Promise<void>((resolve) => {
    releaseTask = resolve;
  });
  pendingFileTasks.set(key, currentTask);

  await previousTask.catch(() => undefined);

  try {
    return await task();
  } finally {
    releaseTask!();
    if (pendingFileTasks.get(key) === currentTask) {
      pendingFileTasks.delete(key);
    }
  }
}
