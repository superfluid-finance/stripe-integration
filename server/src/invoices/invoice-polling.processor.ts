import { Injectable, Logger } from '@nestjs/common';
import { INVOICE_POLLING_QUEUE_NAME } from './invoice-polling.queue';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { POLL_STRIP_INVOICES_NAME_AND_ID } from './invoices.module';
import { INVOICES_QUEUE_NAME } from './invoices.queue';
import { PROCESS_CUSTOMER } from './invoices.processor';

@Processor(INVOICE_POLLING_QUEUE_NAME)
export class InvoicePollingProcessor extends WorkerHost {
    constructor(@InjectQueue(INVOICES_QUEUE_NAME) private readonly invoicesQueue: Queue, @InjectStripeClient() private readonly stripeClient: Stripe) {
        super();
    }

    async process(job: Job<any, any, string>, token?: string): Promise<number> {
        if (job.name !== POLL_STRIP_INVOICES_NAME_AND_ID) {
            logger.debug("Skipping: " + job.name);
            return;
        }

        logger.debug("Processing: " + job.name);

        const stripeInvoicesResponse = await this.stripeClient.invoices.list({
            collection_method: "send_invoice",
            status: "open",
        });

        // TODO: handle "has_more"?
        const stripeInvoices = stripeInvoicesResponse.data

        logger.debug("Queried stripe invoices count: " + stripeInvoices.length)

        const jobs = await this.invoicesQueue.addBulk(stripeInvoices.map(invoice => ({
            name: PROCESS_CUSTOMER,
            data: {}, // TODO: Storing the whole invoice seems totally excessive
            opts: {
                jobId: invoice.customer as string // TODO(KK): not quite right
            }
        })));

        logger.debug("Added more jobs: " + jobs.length)

        return jobs.length;
    }
}

const logger = new Logger(InvoicePollingProcessor.name);
