# Use Next.js for Front-end Server 

## Context

In the realm of Superfluid-Stripe Integration, user checkout sessions and back-end communications will require a robust server-side solution. Only a Single Page Application (SPA) can't sufficiently handle some of the more complex activities reliably. Given these requirements and considering that the Superfluid Widget, which is the main component of our checkout interface, is built on React, a well-adopted framework within the Web3 community, it becomes reasonable that our chosen server solution fits perfectly with React.

## Decision

To meet these specialized needs, we will adopt Next.js, a comprehensive framework for scalable, full-stack React applications that provides a seamless server-side solution.

## Consequences

By using Next.js, we'll be able to construct an efficient server-side infrastructure that perfectly integrates with the client-end, enhances back-end communication, and realiably manages user checkout sessions as required. 