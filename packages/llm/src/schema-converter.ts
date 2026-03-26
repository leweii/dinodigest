import type { z } from "zod";
import { SchemaType, type FunctionDeclarationSchema } from "@google-cloud/vertexai";

/**
 * Convert a Zod schema to Gemini's FunctionDeclarationSchema format.
 *
 * This is a simplified converter that handles the most common Zod types.
 * For complex schemas, you may need to extend this function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodToGeminiSchema(schema: z.ZodSchema<any>): FunctionDeclarationSchema {
  return convertZodType(schema) as unknown as FunctionDeclarationSchema;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertZodType(schema: z.ZodSchema<any>): Record<string, unknown> {
  const def = (schema as unknown as { _def: { typeName: string; [key: string]: unknown } })._def;

  switch (def.typeName) {
    case "ZodString":
      return { type: SchemaType.STRING };

    case "ZodNumber":
    case "ZodFloat":
      return { type: SchemaType.NUMBER };

    case "ZodInt":
      return { type: SchemaType.INTEGER };

    case "ZodBoolean":
      return { type: SchemaType.BOOLEAN };

    case "ZodArray": {
      const arrayDef = def as { typeName: string; type: z.ZodSchema };
      return {
        type: SchemaType.ARRAY,
        items: convertZodType(arrayDef.type),
      };
    }

    case "ZodObject": {
      const objectDef = def as {
        typeName: string;
        shape: () => Record<string, z.ZodSchema>;
      };
      const shape = objectDef.shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        properties[key] = convertZodType(value);
        const valueDef = (value as unknown as { _def: { typeName: string } })._def;
        if (valueDef.typeName !== "ZodOptional") {
          required.push(key);
        }
      }

      return {
        type: SchemaType.OBJECT,
        properties,
        required,
      };
    }

    case "ZodEnum": {
      const enumDef = def as { typeName: string; values: string[] };
      return {
        type: SchemaType.STRING,
        enum: enumDef.values,
      };
    }

    case "ZodOptional": {
      const optionalDef = def as { typeName: string; innerType: z.ZodSchema };
      return {
        ...convertZodType(optionalDef.innerType),
        nullable: true,
      };
    }

    case "ZodDefault": {
      const defaultDef = def as { typeName: string; innerType: z.ZodSchema };
      return convertZodType(defaultDef.innerType);
    }

    default:
      // Fallback: treat as string
      return { type: SchemaType.STRING };
  }
}
