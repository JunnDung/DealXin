import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import * as amqp from "amqp-connection-manager";
import { type ChannelWrapper } from "amqp-connection-manager";
import { type Channel, type ConsumeMessage } from "amqplib";

import { logger } from "../common/logger/pino.logger";

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;
  private readonly connectionUrl: string;
  private isConnected = false;

  constructor() {
    this.connectionUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  }

  async onModuleInit() {
    try {
      await this.connect();
    } catch {
      logger.warn("RabbitMQ unavailable. Messaging features are disabled.");
    }
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect(): Promise<void> {
    logger.info(`Connecting to RabbitMQ at ${this.connectionUrl}`);

    this.connection = amqp.connect([this.connectionUrl], {
      reconnectTimeInSeconds: 5,
    });

    this.connection.on("connect", () => {
      this.isConnected = true;
      logger.info("RabbitMQ connection established");
    });

    this.connection.on("disconnect", (err) => {
      this.isConnected = false;
      logger.warn(
        `RabbitMQ disconnected${err?.err ? `: ${err.err.message}` : ""}`,
      );
    });

    this.connection.on("connectFailed", (err) => {
      this.isConnected = false;
      logger.error(
        `RabbitMQ connection failed${err?.err ? `: ${err.err.message}` : ""}`,
      );
    });

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async () => {
        logger.info("RabbitMQ channel created");
      },
    });

    await this.channelWrapper.waitForConnect();
  }

  async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.channelWrapper || !this.isConnected) {
      logger.debug("RabbitMQ not connected. Skipping publish.");
      return;
    }

    try {
      const message = JSON.stringify(payload);
      await this.channelWrapper.publish("", routingKey, Buffer.from(message), {
        persistent: true,
        contentType: "application/json",
      });
      logger.debug(`Message published to ${routingKey}`);
    } catch (error) {
      logger.error(
        `Failed to publish message to ${routingKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async subscribe(
    queue: string,
    handler: (message: unknown) => Promise<void>,
  ): Promise<void> {
    if (!this.channelWrapper || !this.isConnected) {
      logger.warn(`RabbitMQ not connected. Cannot subscribe to ${queue}.`);
      return;
    }

    try {
      await this.channelWrapper.addSetup(async (channel: Channel) => {
        await channel.assertQueue(queue, {
          durable: true,
        });

        await channel.consume(
          queue,
          async (message: ConsumeMessage | null) => {
            if (!message) return;

            try {
              const content = JSON.parse(message.content.toString());
              await handler(content);
              channel.ack(message);
            } catch (error) {
              logger.error(
                `Error processing message from ${queue}: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
              channel.nack(message, false, false);
            }
          },
          {
            noAck: false,
          },
        );

        logger.info(`Subscribed to queue: ${queue}`);
      });
    } catch (error) {
      logger.error(
        `Failed to subscribe to queue ${queue}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
        this.channelWrapper = null;
      }
      if (this.connection) {
        this.connection.close();
        this.connection = null;
      }
      this.isConnected = false;
      logger.info("RabbitMQ connection closed gracefully");
    } catch (error) {
      logger.error(
        `Error closing RabbitMQ connection: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
