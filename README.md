# Self-Hostable Superfluid-Stripe Integration &middot; ![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) [![Twitter Follow](https://img.shields.io/twitter/follow/Superfluid_HQ?style=social)](https://twitter.com/Superfluid_HQ)

## Preface

[Superfluid](https://www.superfluid.finance/) enables ongoing real-time payments (money streams) on the blockchain. Superfluid's [Checkout Widget](https://www.superfluid.finance/subscriptions) enables streamlined experience for the end-user to start sending Superfluid powered money streams. [Stripe](https://stripe.com/), a proven leader in the digital payment gateway sector, provides seamless setup for businesses allowing them to manage transactions, subscriptions, and even complex billing cycles in a straightforward, efficient manner.

## Introduction

The Superfluid-Stripe Integration provides a bridge between the conventional and the progressive world of digital finance, refining the process of managing subscription-based services. Built as a solution to enable businesses to pull subscription details through Stripe integration, it connects this information to a self-hosted, [Superfluid](https://www.superfluid.finance/) powered checkout UI.

For businesses already using Stripe, this integration allows them to receive on-chain money streams and token transfers as payments using their existing setup. On the other hand, Web3-native businesses can use Stripe's robust features such as CRM, invoicing, and analytics, while accepting payments in a customary on-chain method.

The Superfluid back-end verifies these on-chain payments and updates the invoices as paid via the Stripe API. Note that Stripe does not impose a processing fee for payments marked as `paid_out_of_band`.

## Architecture

This section provides an overview of the principal technologies used in the front-end (checkout UI) and back-end (invoice payment verification) of this integration.

### Backend
1. [TypeScript](https://www.typescriptlang.org/): TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
2. [Nest.js](https://nestjs.com/): A progressive Node.js framework for building efficient, reliable and scalable server-side applications. 
3. [BullMQ](https://bullmq.io/): BullMQ is a fast and robust background job processing library for Redis.
4. [Redis](https://redis.io/): The open source, in-memory data store used by millions of developers as a database, cache, streaming engine, and message broker.

### Frontend
1. [TypeScript](https://www.typescriptlang.org/)
2. [React](https://react.dev/): Javascript library for building user interfaces.
3. [Next.js](https://nextjs.org/): An opinionated React Framework for building full-stack web applications.
4. [@superfluid-finance/widget](https://www.superfluid.finance/subscriptions): Superfluid Checkout Widget

## Development

### Prerequisites

To work on this integration, ensure that you have a Stripe account set up with Stripe's test data configured. You will need the **Secret key** from Stripe and create a fake subscription-based product for testing.

### Requirements

**Docker**
**Redis** needs to be set up locally. A very easy way to do that is to use **Docker**. Install Docker in your system, pull the Redis image, and start up a container. You can easily start up the container by running the `docker:redis` task from the `package.json`'s scripts.


### Local Deployment
- Create a local .env file from example.env file with values for:
```
#Stripe Secret Key
STRIPE_SECRET_KEY=""
# Strip API Key
INTERNAL_API_KEY=""
#Redis queue user
QUEUE_DASHBOARD_USER=
#Redis queue password
QUEUE_DASHBOARD_PASSWORD=
```

- Start the containers using:
```
docker compose -f docker-compose.all.yml up -d
```


### Checkout

You can checkout this repository either locally or through a platform like **GitHub Codespaces** (i.e. Dev Containers) with gives you a convenient way of setting up an isolated development environment with all the dependencies.

### Debugging

For effective debugging, utilize the **Swagger UI** for backend query calls, while the **Bull Dashboard** can be used to view queues and jobs.

That should be enough to get you started on contributing to this project. Happy coding!


## Contributing

We warmly welcome contributions from the community, we recognize all forms of contributions. This could be new features, bug fixes, documentation, tests, discussions about potential changes, or even just reporting a problem.

We truly appreciate your contribution and celebrate it, no matter how small!

Looking forward to your pull request.

## License
This project is [MIT licensed](./LICENSE).