import { Processor, WorkerHost } from "@nestjs/bullmq";
import { INVOICES_QUEUE_NAME } from "./invoices.queue";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { InjectStripeClient } from "@golevelup/nestjs-stripe";
import Stripe from "stripe";

export const PROCESS_CUSTOMER = "process-customer";

@Processor(INVOICES_QUEUE_NAME)
export class InvoicesProcessor extends WorkerHost {
    constructor(@InjectStripeClient() private readonly stripeClient: Stripe) {
        super();
    }

    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        if (job.name !== PROCESS_CUSTOMER) {
            logger.debug("Skipping: " + job.name);
            return;
        }

        logger.debug("Processing: " + job.name);

        // Should split by token?
        const stripeInvoicesResponse = await this.stripeClient.invoices.list({
            customer: job.id,
            collection_method: "send_invoice",

        }); // TODO(KK): why is ID nullable?

        const stripeInvoices = stripeInvoicesResponse.data;

        // TODO(KK): Fail when unknown currency

        // Fetch accounting API
    }
}

const logger = new Logger(InvoicesProcessor.name);