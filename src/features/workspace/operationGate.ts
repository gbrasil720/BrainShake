export class WorkspaceBusyError extends Error {
  constructor() {
    super('Another workspace operation is in progress')
  }
}

export function createWorkspaceOperationGate() {
  let active = false

  return {
    async run<T>(operation: () => Promise<T>): Promise<T> {
      if (active) throw new WorkspaceBusyError()
      active = true
      try {
        return await operation()
      } finally {
        active = false
      }
    }
  }
}
