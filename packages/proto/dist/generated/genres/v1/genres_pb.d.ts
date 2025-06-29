import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv2";
import type { Message } from "@bufbuild/protobuf";
/**
 * Describes the file genres/v1/genres.proto.
 */
export declare const file_genres_v1_genres: GenFile;
/**
 * @generated from message genres.v1.GetGenresRequest
 */
export type GetGenresRequest = Message<"genres.v1.GetGenresRequest"> & {};
/**
 * Describes the message genres.v1.GetGenresRequest.
 * Use `create(GetGenresRequestSchema)` to create a new message.
 */
export declare const GetGenresRequestSchema: GenMessage<GetGenresRequest>;
/**
 * @generated from message genres.v1.GetGenresResponse
 */
export type GetGenresResponse = Message<"genres.v1.GetGenresResponse"> & {
    /**
     * @generated from field: repeated string genres = 1;
     */
    genres: string[];
};
/**
 * Describes the message genres.v1.GetGenresResponse.
 * Use `create(GetGenresResponseSchema)` to create a new message.
 */
export declare const GetGenresResponseSchema: GenMessage<GetGenresResponse>;
/**
 * @generated from service genres.v1.GenresService
 */
export declare const GenresService: GenService<{
    /**
     * @generated from rpc genres.v1.GenresService.GetGenres
     */
    getGenres: {
        methodKind: "unary";
        input: typeof GetGenresRequestSchema;
        output: typeof GetGenresResponseSchema;
    };
}>;
