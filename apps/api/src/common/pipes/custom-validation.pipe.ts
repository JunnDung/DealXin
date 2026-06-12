import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate, ValidationError } from "class-validator";
import "reflect-metadata";

@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metadata)) {
      return value;
    }

    // Create instance of the DTO class
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (metatype as new () => Record<string, unknown>)();

    // Copy all properties from value to instance using defineProperty to bypass read-only
    if (value && typeof value === "object") {
      for (const key of Object.keys(value)) {
        Object.defineProperty(instance, key, {
          value: (value as Record<string, unknown>)[key],
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }

    const errors: ValidationError[] = await validate(instance as object, {
      whitelist: false,
      forbidNonWhitelisted: false,
      skipMissingProperties: false,
      forbidUnknownValues: false,
    });

    if (errors.length > 0) {
      const messages = this.flattenErrors(errors);
      throw new BadRequestException({
        message: "Validation failed",
        errors: messages,
      });
    }

    return instance;
  }

  private toValidate(metadata: ArgumentMetadata): boolean {
    const { metatype, type } = metadata;
    if (type === "custom") return false;
    const types = [String, Boolean, Number, Array, Object, Buffer, Date];
    return !types.some((t) => metatype === t);
  }

  private flattenErrors(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }
      if (error.children) {
        return this.flattenErrors(error.children);
      }
      return [];
    });
  }
}
