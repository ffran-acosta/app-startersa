import { Module } from '@nestjs/common'
import { ActivityConsumer } from './activity.consumer.js'
import { ActivityRepository } from './activity.repository.js'

@Module({
  providers: [ActivityConsumer, ActivityRepository],
})
export class ActivityModule {}
