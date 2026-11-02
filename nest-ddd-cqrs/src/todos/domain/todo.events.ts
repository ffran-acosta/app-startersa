export class TodoCreated {
  constructor(
    readonly todoId: string,
    readonly ownerId: string,
  ) {}
}

export class TodoCompleted {
  constructor(
    readonly todoId: string,
    readonly ownerId: string,
  ) {}
}

export class TodoDeleted {
  constructor(
    readonly todoId: string,
    readonly ownerId: string,
  ) {}
}
