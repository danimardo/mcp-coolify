/**
 * Zod schemas para herramientas de Hetzner
 * 5 herramientas para gestión de Hetzner Cloud
 */

import { z } from "zod";

export const ListLocationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const ListServerTypesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const ListImagesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const ListSSHKeysSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const CreateServerSchema = z.object({
  name: z.string().min(1).describe("Nombre del servidor"),
  server_type: z.string().describe("Tipo de servidor"),
  image: z.string().describe("Imagen del sistema operativo"),
  location: z.string().describe("Ubicación geográfica"),
  ssh_keys: z.array(z.number().int()).optional().describe("IDs de claves SSH"),
  labels: z.record(z.string()).optional().describe("Etiquetas del servidor"),
}).strict();

export const LocationSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  country: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
}).strict();

export const ServerTypeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  cores: z.number().int(),
  memory: z.number(),
  disk: z.number().int(),
  prices: z.array(z.object({
    location: z.string(),
    price_hourly: z.object({ net: z.string(), gross: z.string() }),
    price_monthly: z.object({ net: z.string(), gross: z.string() }),
  })).optional(),
}).strict();

export const ImageSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  status: z.string(),
  name: z.string(),
  description: z.string().optional(),
}).strict();

export const SSHKeySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  public_key: z.string(),
  labels: z.record(z.string()).optional(),
}).strict();

export const ServerSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: z.string(),
  public_net: z.object({
    ipv4: z.object({ ip: z.string() }).optional(),
    ipv6: z.object({ ip: z.string() }).optional(),
  }).optional(),
  server_type: z.object({ id: z.number().int(), name: z.string() }).optional(),
  location: z.object({ id: z.number().int(), name: z.string() }).optional(),
}).strict();

export const LocationsListSchema = z.object({
  locations: z.array(LocationSchema),
  total: z.number().int(),
}).strict();

export const ServerTypesListSchema = z.object({
  server_types: z.array(ServerTypeSchema),
  total: z.number().int(),
}).strict();

export const ImagesListSchema = z.object({
  images: z.array(ImageSchema),
  total: z.number().int(),
}).strict();

export const SSHKeysListSchema = z.object({
  ssh_keys: z.array(SSHKeySchema),
  total: z.number().int(),
}).strict();

export const ServerDetailSchema = z.object({
  server: ServerSchema,
}).strict();

export type ListLocationsParams = z.infer<typeof ListLocationsSchema>;
export type ListServerTypesParams = z.infer<typeof ListServerTypesSchema>;
export type ListImagesParams = z.infer<typeof ListImagesSchema>;
export type ListSSHKeysParams = z.infer<typeof ListSSHKeysSchema>;
export type CreateServerParams = z.infer<typeof CreateServerSchema>;

export type Location = z.infer<typeof LocationSchema>;
export type ServerType = z.infer<typeof ServerTypeSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type SSHKey = z.infer<typeof SSHKeySchema>;
export type Server = z.infer<typeof ServerSchema>;
export type LocationsList = z.infer<typeof LocationsListSchema>;
export type ServerTypesList = z.infer<typeof ServerTypesListSchema>;
export type ImagesList = z.infer<typeof ImagesListSchema>;
export type SSHKeysList = z.infer<typeof SSHKeysListSchema>;
export type ServerDetail = z.infer<typeof ServerDetailSchema>;
