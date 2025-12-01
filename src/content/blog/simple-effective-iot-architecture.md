---
title: "Simple and effective architecture for managing IoT data at scale"
description: "An architectural approach that allows you to start simply but with solid scalability foundations for IoT data management."
pubDate: 2025-10-07
heroImage: "/i.jpg"
readingTime: "3 min read"
tags: ["iot", "architecture", "kafka", "mqtt", "timescaledb"]
---

# Simple and effective architecture for managing IoT data at scale

One of the most interesting (and complex) topics in IoT platform development is data flow management: thousands of devices, heterogeneous data, high but not always uniform reception frequency, need for near real-time analysis and historical archiving.

Today I share an architectural approach that allows you to start simply but with solid scalability foundations.

## Ingestion: from the field to the broker

In the OT (Operational Technology) field, protocols different from those normally used in IT (Information Technology) are usually used, but the number of devices that natively support MQTT is growing, and where it's not present, it can be integrated through the use of industrial Gateways that, based on specificities, can also be used for Edge computing processes. For this reason, the MQTT protocol is the natural choice: lightweight, reliable and optimized for devices with limited resources and not always stable connections.

There are several open-source MQTT brokers (such as Mosquitto, EMQX) and commercial ones (HiveMQ) that offer advanced features such as authentication, authorization, message persistence and horizontal scalability, and SaaS solutions like Azure IoT Hub or AWS IoT Core that natively integrate MQTT.

## The data backbone: Kafka

Once they arrive at the MQTT broker, messages are forwarded to Kafka (or alternatives like Redpanda). For these two tools, native connectors exist, both open-source and commercial, that simplify integration.

Here comes the concept of data backbone.

Thanks to Kafka we can obtain the following advantages:

* **decoupling** → producers (devices) don't need to know consumers (services), so data can be consumed by multiple services in parallel or at different times;
* **scalability** → you can add new consumers without the need to update devices;
* **replay** → messages are not lost and can be reprocessed.

## Processing: how we transform data

From the backbone, a microservice written in TypeScript reads messages, processes them, normalizes them according to needs and enriches them with metadata (for example server-side timestamp or other necessary information).

A conceptual example in a few lines:

```typescript
import { Kafka } from "kafkajs";
const kafka = new Kafka({ clientId: "iot-processor", brokers: ["localhost:9092"] });

const consumer = kafka.consumer({ groupId: "iot-group" });

await consumer.connect();
await consumer.subscribe({ topic: "iot-data" });

await consumer.run({
  eachMessage: async ({ message }) => {
    const payload = JSON.parse(message.value!.toString());
    const enriched = { ...payload, processedAt: new Date().toISOString() };
    // -> here data is processed and saved to TimescaleDB
  }
});
```

This approach covers needs from simple to moderately complicated, but for more complex cases (time windows, joins, stateful aggregations) frameworks like Kafka Streams or Apache Flink can be adopted. They offer advanced analytical capabilities, but also introduce greater complexity and language constraints.

## Storage: where do we save data?

Processed data can be saved to TimescaleDB, a PostgreSQL extension optimized for time series.

Why Timescale?

* It allows working with standard SQL (thus reducing the learning curve).
* It's designed for time-series data (compression, queries on time intervals, automatic partition management).
* It integrates easily with analysis and visualization tools.
* It has several advanced features like continuous aggregates, which allow creating automatically updated materialized views.

## Conclusions

This architecture — MQTT → Kafka/Redpanda → Processing in TypeScript → TimescaleDB — balances simplicity and scalability.

It's a solid foundation that allows growth without having to rewrite everything when data volumes increase.

In future articles I'll delve into some specific aspects, such as data visualization or authentication and security models. If you're interested in the topic, let me know in the comments which topics you'd like to explore further.

