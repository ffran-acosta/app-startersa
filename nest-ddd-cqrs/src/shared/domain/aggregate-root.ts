/**
 * Acumula los eventos de dominio que produce el aggregate. El handler del
 * comando los publica con `pullEvents()` después de persistir.
 */
export abstract class AggregateRoot {
  private events: object[] = []

  protected record(event: object): void {
    this.events.push(event)
  }

  pullEvents(): object[] {
    const events = this.events
    this.events = []
    return events
  }
}
