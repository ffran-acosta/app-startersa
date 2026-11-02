import { Global, Module } from '@nestjs/common'
import { OutboxRelay } from './outbox-relay.js'
import { OutboxRepository } from './outbox.repository.js'
import { ProcessedEventsRepository } from './processed-events.repository.js'
import { RedisService } from './redis.service.js'

@Global()
@Module({
  providers: [
    RedisService,
    OutboxRepository,
    ProcessedEventsRepository,
    OutboxRelay,
  ],
  exports: [RedisService, OutboxRepository, ProcessedEventsRepository],
})
export class EventsModule {}
