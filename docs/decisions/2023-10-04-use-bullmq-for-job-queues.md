# Use BullMQ for Job Queues

## Context

In a system-to-system integration project, using a job queue becomes essential to manage and sequence tasks securely and efficiently. Factors such as reliability, idempotency and monitorability are paramount when integrating systems over the internet.

## Decision

We have decided to leverage BullMQ, a Redis-based queue library, for job queue management due to its popularity, scalability, and durability in the JavaScript ecosystem. Furthermore, it is open-source, free and MIT-licensed, well-maintainted and backed by a company (https://taskforce.sh/).

## Consequences

By choosing BullMQ, we will acquire a robust system for job queuing, that is reliable, idempotent, and easily monitorable.
