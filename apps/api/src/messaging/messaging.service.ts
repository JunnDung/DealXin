import {
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import * as amqp from "amqp-connection-manager";
import { ChannelWrapper } from "amqp-connection-manager";
import { Channel, ConsumeMessage } from "amqplib";
import { logger } from "../common/logger/pino.logger";

@Injectable()
export class MessagingService implements OnModuleInit {
  private connection: amqp.AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;
  private readonly connectionUrl: string;
  private isConnected = false;

  constructor() {
    this.connectionUrl =
      process.env.RABBITMQ_URL || "amqp://localhost:5672";
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect(): Promise<void> {
    try {
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
    } catch (error) {
      logger.error(
        `Failed to connect to RabbitMQ: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.channelWrapper || !this.isConnected) {
      logger.warn(
        "RabbitMQ not connected. Message will be queued for retry.",
      );
      await this.waitForConnection();
    }

    try {
      const message = JSON.stringify(payload);
      await this.channelWrapper!.publish(
        "",
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          contentType: "application/json",
        }
      );
      logger.debug(`Message published to ${routingKey}`);
    } catch (error) {
      logger.error(
        `Failed to publish message to ${routingKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  async subscribe(
    queue: string,
    handler: (msg: unknown) => Promise<void>
  ): Promise<void> {
    if (!this.channelWrapper || !this.isConnected) {
      logger.warn("RabbitMQ not connected. Waiting for connection...");
      await this.waitForConnection();
    }

    try {
      await this.channelWrapper!.addSetup(async (channel: Channel) => {
        await channel.assertQueue(queue, {
          durable: true,
        });

        await channel.consume(
          queue,
          async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            try {
              const content = JSON.parse(msg.content.toString());
              await handler(content);
              channel.ack(msg);
            } catch (error) {
              logger.error(
                `Error processing message from ${queue}: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
              channel.nack(msg, false, false);
            }
          },
          {
            noAck: false,
          }
        );

        logger.info(`Subscribed to queue: ${queue}`);
      });
    } catch (error) {
      logger.error(
        `Failed to subscribe to queue ${queue}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  private async waitForConnection(maxWaitMs = 30000): Promise<void> {
    if (this.isConnected && this.channelWrapper) {
      return;
    }

    const startTime = Date.now();

    while (!this.isConnected || !this.channelWrapper) {
      if (Date.now() - startTime > maxWaitMs) {
        throw new Error(
          "Timeout waiting for RabbitMQ connection"
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
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
