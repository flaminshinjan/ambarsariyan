import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    makeCounterProvider({
      name: 'workflow_runs_total',
      help: 'Total number of workflow runs',
      labelNames: ['status'],
    }),
    makeCounterProvider({
      name: 'task_runs_total',
      help: 'Total number of task runs',
      labelNames: ['status', 'handler'],
    }),
    makeHistogramProvider({
      name: 'workflow_execution_duration_seconds',
      help: 'Workflow execution duration in seconds',
    }),
    makeHistogramProvider({
      name: 'task_execution_duration_seconds',
      help: 'Task execution duration in seconds',
      labelNames: ['handler'],
    }),
    makeGaugeProvider({
      name: 'active_workflow_runs',
      help: 'Number of currently active workflow runs',
    }),
  ],
  exports: [
    PrometheusModule,
  ],
})
export class MetricsModule {}
