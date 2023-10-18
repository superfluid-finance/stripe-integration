# Use Docker for Containerization

## Context

To ensure an efficient deployment process for our Superfluid-Stripe Integration, we need to containerize our applications/services. This is important as it can significantly simplify the deployment to different cloud platforms while ensuring a standardized and secure environment for running our applications. Furthermore, given the anticipated scaling needs of our job queue processing, container orchestration tools like Kubernetes could potentially be employed for superior control and scalability.

## Decision

In light of these considerations, we have chosen Docker for our containerization needs for both development and production environments.

## Consequences

By using Docker, we will ensure a simple, secure, and scalable deployment process across varied cloud platforms. Moreover, we open up the possibility for advanced scaling via Kubernetes, which is highly beneficial given the demands of job queue processing for high traffic merchants.