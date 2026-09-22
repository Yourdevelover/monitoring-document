let pendingFileTask: Promise<void> = Promise.resolve();

export function enqueueFileTask<T>(task: () => Promise<T>): Promise<T> {
  const previousTask = pendingFileTask;

  let releaseTask: () => void;

  pendingFileTask = new Promise<void>((resolve) => {
    releaseTask = resolve;
  });

  return previousTask
    .catch(() => undefined)
    .then(async () => {
      try {
        return await task();
      } finally {
        releaseTask();
      }
    });
}
