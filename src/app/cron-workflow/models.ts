import { CronWorkflow } from "../../api";
import * as yaml from 'js-yaml';
import { isUndefined } from "util";

export class CronWorkflowFormatter {
    static fromYaml(input: string): CronWorkflow {
        const data = yaml.safeLoad(input);
        console.log(data);

        if(!data.schedule) {
            throw new Error("Missing schedule");
        }

        if(!data.timezone) {
            throw new Error("Missing timezone");
        }

        if(isUndefined(data.suspend)) {
            throw new Error("Missing suspend");
        }

        if(!data.concurrencyPolicy) {
            throw new Error("Missing Concurrency Policy");
        }

        if(isUndefined(data.startingDeadlineSeconds)) {
            throw new Error("Missing startingDeadlineSeconds");
        }

        if(!data.successfulJobsHistoryLimit) {
            throw new Error("Missing successfulJobsHistoryLimit");
        }

        if(!data.failedJobsHistoryLimit) {
            throw new Error("Missing failedJobsHistoryLimit");
        }

        let workflow: CronWorkflow = {
            name: data.name,
            schedule: data.schedule,
            timezone: data.timezone,
            suspend: data.suspend,
            concurrencyPolicy: data.concurrencyPolicy,
            startingDeadlineSeconds: data.startingDeadlineSeconds,
            successfulJobsHistoryLimit: data.successfulJobsHistoryLimit,
            failedJobsHistoryLimit: data.failedJobsHistoryLimit
        };

        return workflow;
    }

    static toYamlString(input: CronWorkflow, withComments = false) {
        let result = '';

        if(withComments) {
            result += "# Schedule at which the Workflow will be run. E.g.5 4 * * *\n";
        }

        let scheduleValue = "\"* * * * *\"";
        if(input.schedule) {
            scheduleValue = `"${input.schedule}"`;
        }

        result += "schedule: " + scheduleValue + "\n";

        if(withComments) {
            result += "# Timezone during which the Workflow will be run. E.g. America/Los_Angeles\n";
        }
        result += "timezone: " + (input.timezone || "Etc/UTC") + "\n";

        if(withComments) {
            result += "# If true Workflow scheduling will not occur.\n";
        }
        result += "suspend: " + (input.suspend || "false") + "\n";

        if(withComments) {
            result += `# Policy that determines what to do if multiple Workflows are scheduled at the same time.
# Available options:
#   Allow: allow all
#   Replace: remove all old before scheduling a new
#   Forbid: do not allow any new while there are old
`;
        }
        result += "concurrencyPolicy: " + (input.concurrencyPolicy || "Allow") + "\n";

        if(withComments) {
            result += "# Number of seconds after the last successful run during which a missed Workflow will be run\n";
        }
        result += "startingDeadlineSeconds: " + (input.startingDeadlineSeconds || "0") + "\n";

        if(withComments) {
            result += "# Number of successful Workflows that will be persisted at a time\n";
        }
        result += "successfulJobsHistoryLimit: " + (input.successfulJobsHistoryLimit || "3") + "\n";

        if(withComments) {
            result += "# Number of failed Workflows that will be persisted at a time\n";
        }
        result += "failedJobsHistoryLimit: " + (input.failedJobsHistoryLimit || "1") + "\n";

        return result;
    }
}
