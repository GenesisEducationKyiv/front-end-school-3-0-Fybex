import type { GenEnum, GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv2";
import type { Timestamp } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";
/**
 * Describes the file tracks/v1/tracks.proto.
 */
export declare const file_tracks_v1_tracks: GenFile;
/**
 * @generated from message tracks.v1.Track
 */
export type Track = Message<"tracks.v1.Track"> & {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * @generated from field: string title = 2;
     */
    title: string;
    /**
     * @generated from field: string artist = 3;
     */
    artist: string;
    /**
     * @generated from field: optional string album = 4;
     */
    album?: string;
    /**
     * @generated from field: repeated string genres = 5;
     */
    genres: string[];
    /**
     * @generated from field: string slug = 6;
     */
    slug: string;
    /**
     * @generated from field: optional string cover_image = 7;
     */
    coverImage?: string;
    /**
     * @generated from field: optional string audio_file = 8;
     */
    audioFile?: string;
    /**
     * @generated from field: google.protobuf.Timestamp created_at = 9;
     */
    createdAt?: Timestamp;
    /**
     * @generated from field: google.protobuf.Timestamp updated_at = 10;
     */
    updatedAt?: Timestamp;
};
/**
 * Describes the message tracks.v1.Track.
 * Use `create(TrackSchema)` to create a new message.
 */
export declare const TrackSchema: GenMessage<Track>;
/**
 * @generated from message tracks.v1.CreateTrackRequest
 */
export type CreateTrackRequest = Message<"tracks.v1.CreateTrackRequest"> & {
    /**
     * @generated from field: string title = 1;
     */
    title: string;
    /**
     * @generated from field: string artist = 2;
     */
    artist: string;
    /**
     * @generated from field: optional string album = 3;
     */
    album?: string;
    /**
     * @generated from field: repeated string genres = 4;
     */
    genres: string[];
    /**
     * @generated from field: optional string cover_image = 5;
     */
    coverImage?: string;
};
/**
 * Describes the message tracks.v1.CreateTrackRequest.
 * Use `create(CreateTrackRequestSchema)` to create a new message.
 */
export declare const CreateTrackRequestSchema: GenMessage<CreateTrackRequest>;
/**
 * @generated from message tracks.v1.CreateTrackResponse
 */
export type CreateTrackResponse = Message<"tracks.v1.CreateTrackResponse"> & {
    /**
     * @generated from field: tracks.v1.Track track = 1;
     */
    track?: Track;
};
/**
 * Describes the message tracks.v1.CreateTrackResponse.
 * Use `create(CreateTrackResponseSchema)` to create a new message.
 */
export declare const CreateTrackResponseSchema: GenMessage<CreateTrackResponse>;
/**
 * @generated from message tracks.v1.GetTracksRequest
 */
export type GetTracksRequest = Message<"tracks.v1.GetTracksRequest"> & {
    /**
     * @generated from field: optional int32 page = 1;
     */
    page?: number;
    /**
     * @generated from field: optional int32 limit = 2;
     */
    limit?: number;
    /**
     * @generated from field: optional tracks.v1.SortField sort = 3;
     */
    sort?: SortField;
    /**
     * @generated from field: optional tracks.v1.SortOrder order = 4;
     */
    order?: SortOrder;
    /**
     * @generated from field: optional string search = 5;
     */
    search?: string;
    /**
     * @generated from field: optional string genre = 6;
     */
    genre?: string;
    /**
     * @generated from field: optional string artist = 7;
     */
    artist?: string;
};
/**
 * Describes the message tracks.v1.GetTracksRequest.
 * Use `create(GetTracksRequestSchema)` to create a new message.
 */
export declare const GetTracksRequestSchema: GenMessage<GetTracksRequest>;
/**
 * @generated from message tracks.v1.GetTracksResponse
 */
export type GetTracksResponse = Message<"tracks.v1.GetTracksResponse"> & {
    /**
     * @generated from field: repeated tracks.v1.Track tracks = 1;
     */
    tracks: Track[];
    /**
     * @generated from field: tracks.v1.PaginationMeta meta = 2;
     */
    meta?: PaginationMeta;
};
/**
 * Describes the message tracks.v1.GetTracksResponse.
 * Use `create(GetTracksResponseSchema)` to create a new message.
 */
export declare const GetTracksResponseSchema: GenMessage<GetTracksResponse>;
/**
 * @generated from message tracks.v1.PaginationMeta
 */
export type PaginationMeta = Message<"tracks.v1.PaginationMeta"> & {
    /**
     * @generated from field: int32 total = 1;
     */
    total: number;
    /**
     * @generated from field: int32 page = 2;
     */
    page: number;
    /**
     * @generated from field: int32 limit = 3;
     */
    limit: number;
    /**
     * @generated from field: int32 total_pages = 4;
     */
    totalPages: number;
};
/**
 * Describes the message tracks.v1.PaginationMeta.
 * Use `create(PaginationMetaSchema)` to create a new message.
 */
export declare const PaginationMetaSchema: GenMessage<PaginationMeta>;
/**
 * @generated from message tracks.v1.GetTrackBySlugRequest
 */
export type GetTrackBySlugRequest = Message<"tracks.v1.GetTrackBySlugRequest"> & {
    /**
     * @generated from field: string slug = 1;
     */
    slug: string;
};
/**
 * Describes the message tracks.v1.GetTrackBySlugRequest.
 * Use `create(GetTrackBySlugRequestSchema)` to create a new message.
 */
export declare const GetTrackBySlugRequestSchema: GenMessage<GetTrackBySlugRequest>;
/**
 * @generated from message tracks.v1.GetTrackBySlugResponse
 */
export type GetTrackBySlugResponse = Message<"tracks.v1.GetTrackBySlugResponse"> & {
    /**
     * @generated from field: tracks.v1.Track track = 1;
     */
    track?: Track;
};
/**
 * Describes the message tracks.v1.GetTrackBySlugResponse.
 * Use `create(GetTrackBySlugResponseSchema)` to create a new message.
 */
export declare const GetTrackBySlugResponseSchema: GenMessage<GetTrackBySlugResponse>;
/**
 * @generated from message tracks.v1.UpdateTrackRequest
 */
export type UpdateTrackRequest = Message<"tracks.v1.UpdateTrackRequest"> & {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * @generated from field: optional string title = 2;
     */
    title?: string;
    /**
     * @generated from field: optional string artist = 3;
     */
    artist?: string;
    /**
     * @generated from field: optional string album = 4;
     */
    album?: string;
    /**
     * @generated from field: repeated string genres = 5;
     */
    genres: string[];
    /**
     * @generated from field: optional string cover_image = 6;
     */
    coverImage?: string;
    /**
     * @generated from field: optional string audio_file = 7;
     */
    audioFile?: string;
};
/**
 * Describes the message tracks.v1.UpdateTrackRequest.
 * Use `create(UpdateTrackRequestSchema)` to create a new message.
 */
export declare const UpdateTrackRequestSchema: GenMessage<UpdateTrackRequest>;
/**
 * @generated from message tracks.v1.UpdateTrackResponse
 */
export type UpdateTrackResponse = Message<"tracks.v1.UpdateTrackResponse"> & {
    /**
     * @generated from field: tracks.v1.Track track = 1;
     */
    track?: Track;
};
/**
 * Describes the message tracks.v1.UpdateTrackResponse.
 * Use `create(UpdateTrackResponseSchema)` to create a new message.
 */
export declare const UpdateTrackResponseSchema: GenMessage<UpdateTrackResponse>;
/**
 * @generated from message tracks.v1.DeleteTrackRequest
 */
export type DeleteTrackRequest = Message<"tracks.v1.DeleteTrackRequest"> & {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
};
/**
 * Describes the message tracks.v1.DeleteTrackRequest.
 * Use `create(DeleteTrackRequestSchema)` to create a new message.
 */
export declare const DeleteTrackRequestSchema: GenMessage<DeleteTrackRequest>;
/**
 * @generated from message tracks.v1.DeleteTrackResponse
 */
export type DeleteTrackResponse = Message<"tracks.v1.DeleteTrackResponse"> & {
    /**
     * @generated from field: bool success = 1;
     */
    success: boolean;
};
/**
 * Describes the message tracks.v1.DeleteTrackResponse.
 * Use `create(DeleteTrackResponseSchema)` to create a new message.
 */
export declare const DeleteTrackResponseSchema: GenMessage<DeleteTrackResponse>;
/**
 * @generated from message tracks.v1.DeleteTracksRequest
 */
export type DeleteTracksRequest = Message<"tracks.v1.DeleteTracksRequest"> & {
    /**
     * @generated from field: repeated string ids = 1;
     */
    ids: string[];
};
/**
 * Describes the message tracks.v1.DeleteTracksRequest.
 * Use `create(DeleteTracksRequestSchema)` to create a new message.
 */
export declare const DeleteTracksRequestSchema: GenMessage<DeleteTracksRequest>;
/**
 * @generated from message tracks.v1.DeleteTracksResponse
 */
export type DeleteTracksResponse = Message<"tracks.v1.DeleteTracksResponse"> & {
    /**
     * @generated from field: repeated string success = 1;
     */
    success: string[];
    /**
     * @generated from field: repeated string failed = 2;
     */
    failed: string[];
};
/**
 * Describes the message tracks.v1.DeleteTracksResponse.
 * Use `create(DeleteTracksResponseSchema)` to create a new message.
 */
export declare const DeleteTracksResponseSchema: GenMessage<DeleteTracksResponse>;
/**
 * @generated from message tracks.v1.UploadFileRequest
 */
export type UploadFileRequest = Message<"tracks.v1.UploadFileRequest"> & {
    /**
     * @generated from field: string track_id = 1;
     */
    trackId: string;
    /**
     * @generated from field: string filename = 2;
     */
    filename: string;
    /**
     * @generated from field: bytes content = 3;
     */
    content: Uint8Array;
    /**
     * @generated from field: string content_type = 4;
     */
    contentType: string;
};
/**
 * Describes the message tracks.v1.UploadFileRequest.
 * Use `create(UploadFileRequestSchema)` to create a new message.
 */
export declare const UploadFileRequestSchema: GenMessage<UploadFileRequest>;
/**
 * @generated from message tracks.v1.UploadFileResponse
 */
export type UploadFileResponse = Message<"tracks.v1.UploadFileResponse"> & {
    /**
     * @generated from field: tracks.v1.Track track = 1;
     */
    track?: Track;
};
/**
 * Describes the message tracks.v1.UploadFileResponse.
 * Use `create(UploadFileResponseSchema)` to create a new message.
 */
export declare const UploadFileResponseSchema: GenMessage<UploadFileResponse>;
/**
 * @generated from message tracks.v1.DeleteFileRequest
 */
export type DeleteFileRequest = Message<"tracks.v1.DeleteFileRequest"> & {
    /**
     * @generated from field: string track_id = 1;
     */
    trackId: string;
};
/**
 * Describes the message tracks.v1.DeleteFileRequest.
 * Use `create(DeleteFileRequestSchema)` to create a new message.
 */
export declare const DeleteFileRequestSchema: GenMessage<DeleteFileRequest>;
/**
 * @generated from message tracks.v1.DeleteFileResponse
 */
export type DeleteFileResponse = Message<"tracks.v1.DeleteFileResponse"> & {
    /**
     * @generated from field: tracks.v1.Track track = 1;
     */
    track?: Track;
};
/**
 * Describes the message tracks.v1.DeleteFileResponse.
 * Use `create(DeleteFileResponseSchema)` to create a new message.
 */
export declare const DeleteFileResponseSchema: GenMessage<DeleteFileResponse>;
/**
 * @generated from enum tracks.v1.SortField
 */
export declare enum SortField {
    /**
     * @generated from enum value: SORT_FIELD_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SORT_FIELD_TITLE = 1;
     */
    TITLE = 1,
    /**
     * @generated from enum value: SORT_FIELD_ARTIST = 2;
     */
    ARTIST = 2,
    /**
     * @generated from enum value: SORT_FIELD_ALBUM = 3;
     */
    ALBUM = 3,
    /**
     * @generated from enum value: SORT_FIELD_CREATED_AT = 4;
     */
    CREATED_AT = 4
}
/**
 * Describes the enum tracks.v1.SortField.
 */
export declare const SortFieldSchema: GenEnum<SortField>;
/**
 * @generated from enum tracks.v1.SortOrder
 */
export declare enum SortOrder {
    /**
     * @generated from enum value: SORT_ORDER_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SORT_ORDER_ASC = 1;
     */
    ASC = 1,
    /**
     * @generated from enum value: SORT_ORDER_DESC = 2;
     */
    DESC = 2
}
/**
 * Describes the enum tracks.v1.SortOrder.
 */
export declare const SortOrderSchema: GenEnum<SortOrder>;
/**
 * @generated from service tracks.v1.TracksService
 */
export declare const TracksService: GenService<{
    /**
     * @generated from rpc tracks.v1.TracksService.GetTracks
     */
    getTracks: {
        methodKind: "unary";
        input: typeof GetTracksRequestSchema;
        output: typeof GetTracksResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.GetTrackBySlug
     */
    getTrackBySlug: {
        methodKind: "unary";
        input: typeof GetTrackBySlugRequestSchema;
        output: typeof GetTrackBySlugResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.CreateTrack
     */
    createTrack: {
        methodKind: "unary";
        input: typeof CreateTrackRequestSchema;
        output: typeof CreateTrackResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.UpdateTrack
     */
    updateTrack: {
        methodKind: "unary";
        input: typeof UpdateTrackRequestSchema;
        output: typeof UpdateTrackResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.DeleteTrack
     */
    deleteTrack: {
        methodKind: "unary";
        input: typeof DeleteTrackRequestSchema;
        output: typeof DeleteTrackResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.DeleteTracks
     */
    deleteTracks: {
        methodKind: "unary";
        input: typeof DeleteTracksRequestSchema;
        output: typeof DeleteTracksResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.UploadFile
     */
    uploadFile: {
        methodKind: "unary";
        input: typeof UploadFileRequestSchema;
        output: typeof UploadFileResponseSchema;
    };
    /**
     * @generated from rpc tracks.v1.TracksService.DeleteFile
     */
    deleteFile: {
        methodKind: "unary";
        input: typeof DeleteFileRequestSchema;
        output: typeof DeleteFileResponseSchema;
    };
}>;
