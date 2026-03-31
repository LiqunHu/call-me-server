import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import * as z from 'zod'

extendZodWithOpenApi(z)

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

type ValidatorApiItem = {
  name?: string
  summary?: string
  description?: string
  path: string
  type: HttpMethod
  ZodSchema?: {
    body?: z.ZodTypeAny
    query?: z.ZodTypeAny
    params?: z.ZodTypeAny
  }
}

type ValidatorModule = {
  name?: string
  apiList?: Record<string, ValidatorApiItem>
}

const projectRoot = path.resolve(__dirname, '../..')
const servicesRoot = path.join(projectRoot, 'src/services')
const outputPath = path.join(projectRoot, 'public/swagger/swagger.json')

const collectValidatorFiles = async (rootDir: string): Promise<string[]> => {
  const files: string[] = []
  const entries = await fs.readdir(rootDir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectValidatorFiles(fullPath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.validator.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

const toObjectSchema = (schema?: z.ZodTypeAny): z.ZodObject<z.ZodRawShape> | undefined => {
  if (!schema) {
    return undefined
  }

  if (schema instanceof z.ZodObject) {
    return schema
  }

  return undefined
}

const buildRegistry = async () => {
  const registry = new OpenAPIRegistry()
  const validatorFiles = await collectValidatorFiles(servicesRoot)

  for (const filePath of validatorFiles) {
    const moduleId = path.basename(filePath).replace(/\.validator\.ts$/, '')
    const imported = (await import(pathToFileURL(filePath).href)) as { default?: ValidatorModule }
    const validator = imported.default
    if (!validator?.apiList) {
      continue
    }

    for (const [key, api] of Object.entries(validator.apiList)) {
      const method = api.type?.toLowerCase() as HttpMethod
      const requestBodySchema = toObjectSchema(api.ZodSchema?.body)
      const querySchema = toObjectSchema(api.ZodSchema?.query)
      const paramsSchema = toObjectSchema(api.ZodSchema?.params)

      registry.registerPath({
        method,
        path: api.path,
        operationId: `${moduleId}:${key}`,
        summary: api.summary ?? api.name ?? key,
        description: api.description ?? api.name ?? key,
        request: {
          ...(paramsSchema ? { params: paramsSchema } : {}),
          ...(querySchema ? { query: querySchema } : {}),
          ...(requestBodySchema
            ? {
                body: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: requestBodySchema,
                    },
                  },
                },
              }
            : {}),
        },
        responses: {
          200: {
            description: 'Success',
          },
        },
      })
    }
  }

  return registry
}

const main = async () => {
  const registry = await buildRegistry()
  const generator = new OpenApiGeneratorV3(registry.definitions)
  const swaggerDoc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Call Me API',
      version: '1.0.0',
    },
  })

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(swaggerDoc, null, 2), 'utf-8')
  console.log(`Swagger JSON generated at: ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
