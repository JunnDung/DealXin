import pino from "pino";

const level = process.env.NODE_ENV === "production" ? "info" : "debug";

export const logger = pino({
  name: "dealxin-api",
  level,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
});
