import type {
  DescMessage,
  DescMethodUnary,
  MessageInitShape,
  MessageShape,
} from "@bufbuild/protobuf";
import type { ConnectError } from "@connectrpc/connect";
import {
  useMutation,
  type UseMutationOptions,
} from "@connectrpc/connect-query";
import type { UseMutationResult } from "@tanstack/react-query";

export function useApiMutation<
  I extends DescMessage,
  O extends DescMessage,
  Ctx = unknown
>(
  schema: DescMethodUnary<I, O>,
  { transport, ...mutationOptions }: UseMutationOptions<I, O, Ctx> = {}
): UseMutationResult<MessageShape<O>, ConnectError, MessageInitShape<I>, Ctx> {
  return useMutation<I, O, Ctx>(schema, {
    throwOnError: true,
    ...(transport && { transport }),
    ...mutationOptions,
  });
}
