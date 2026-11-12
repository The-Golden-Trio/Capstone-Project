/**
 * CL-05 `LifecycleModule` (dùng chung API và worker): SM-01 và cách đọc một
 * scenario mà `ScenarioModule`, `ReviewModule`, `PublishingModule` cùng cần.
 */
import { Module } from '@nestjs/common';
import { ScenarioStateMachine } from './scenario-state-machine';
import { ScenarioViewService } from './scenario-view.service';

@Module({
  providers: [ScenarioStateMachine, ScenarioViewService],
  exports: [ScenarioStateMachine, ScenarioViewService],
})
export class LifecycleModule {}
