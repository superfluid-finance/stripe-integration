# Use Stripe for Configuration Storage

## Context

Throughout the development of Superfluid-Stripe Integration, there lies a need for storing configurations. These include: 
1. Mapping of Stripe currencies to on-chain tokens
2. Token receiver mappings per chain
3. Look and feel of the front-end interface. 

## Options

Three alternatives were considered for configuration storage:

1. Utilizing a database
2. Environment variables
3. Using Stripe entities with a Metadata fields

## Decision

We have decided to utilize Stripe as the preferred solution for storing important configurations. The Stripe Metadata fields will be harnessed for storing requisite configurations, which essentially entails the creation of "fake" Customers on Stripe to carry the necessary information.

## Consequences

Opting for Stripe brings multiple benefits: simplicity of use for merchants, provision of an instant audit trail, a seamless feel of integration with Stripe, and obviating the need for additional technologies.

The other options, while currently not our primary choice, may become viable in future, especially if Stripe's storage capacity becomes a limiting factor. Thus, we might consider a hybrid approach that involves multiple configuration sources in future, keeping Stripe as the first choice for now.