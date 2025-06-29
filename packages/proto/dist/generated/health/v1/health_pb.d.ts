import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv2";
import type { Message } from "@bufbuild/protobuf";
/**
 * Describes the file health/v1/health.proto.
 */
export declare const file_health_v1_health: GenFile;
/**
 * @generated from message health.v1.HealthCheckRequest
 */
export type HealthCheckRequest = Message<"health.v1.HealthCheckRequest"> & {};
/**
 * Describes the message health.v1.HealthCheckRequest.
 * Use `create(HealthCheckRequestSchema)` to create a new message.
 */
export declare const HealthCheckRequestSchema: GenMessage<HealthCheckRequest>;
/**
 * @generated from message health.v1.HealthCheckResponse
 */
export type HealthCheckResponse = Message<"health.v1.HealthCheckResponse"> & {
    /**
     * @generated from field: string status = 1;
     */
    status: string;
};
/**
 * Describes the message health.v1.HealthCheckResponse.
 * Use `create(HealthCheckResponseSchema)` to create a new message.
 */
export declare const HealthCheckResponseSchema: GenMessage<HealthCheckResponse>;
/**
 * @generated from service health.v1.HealthService
 */
export declare const HealthService: GenService<{
    /**
     * @generated from rpc health.v1.HealthService.HealthCheck
     */
    healthCheck: {
        methodKind: "unary";
        input: typeof HealthCheckRequestSchema;
        output: typeof HealthCheckResponseSchema;
    };
}>;
