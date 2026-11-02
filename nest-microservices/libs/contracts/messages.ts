import { RpcException } from '@nestjs/microservices'
import type { AuthMessages } from './auth.js'
import type { TodosMessages } from './todos.js'

/**
 * Todos los mensajes request-response que viajan por NATS: patrón → payload y
 * resultado. El gateway envía con estos tipos y cada servicio los implementa.
 * Los handlers sin respuesta devuelven `null`: un `undefined` llega al gateway
 * como un observable vacío.
 */
export type Messages = AuthMessages & TodosMessages
export type Pattern = keyof Messages
export type MessagePayload<P extends Pattern> = Messages[P]['payload']
export type MessageResult<P extends Pattern> = Messages[P]['result']

/** Cómo llega un resultado al otro lado: JSON, así que las fechas son strings. */
export type Json<T> = T extends Date
  ? string
  : T extends object
    ? { [K in keyof T]: Json<T[K]> }
    : T

/** Error esperado de un servicio; el gateway responde con este status HTTP. */
export interface RpcErrorBody {
  statusCode: number
  message: string
}

export function rpcError(statusCode: number, message: string): RpcException {
  return new RpcException({ statusCode, message } satisfies RpcErrorBody)
}
