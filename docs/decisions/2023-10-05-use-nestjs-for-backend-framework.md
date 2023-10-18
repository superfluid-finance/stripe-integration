# Use Nest.js for Back-end Server Framework

## Context

In the lifecycle of a scalable and maintainable project, an opinionated and organized back-end structure is imperative. Nest.js, being a thoroughly documented and widely adopted back-end framework in the JavaScript ecosystem, offers an excellent base for our system-to-system integration project. Furthermore, the BullMQ + Nest.js integration is well documented, making them an ideal combination.

## Decision

Opting for the Nest.js framework, we will utilize its dependency injection system to improve testability and separation of concerns. Additionally, we will follow the modular monolith approach for good organization of code and to maintain simplicity and understandability in deployment, thereby avoiding the complexities of microservices.

## Consequences

The adoption of Nest.js as our back-end server framework will provide us with a highly structured and maintainable codebase along with seamless integration with our selected job queue library, BullMQ.