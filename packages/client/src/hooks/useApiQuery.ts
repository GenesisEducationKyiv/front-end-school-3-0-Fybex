import type {
  DescMessage,
  DescMethodUnary,
  MessageInitShape,
  MessageShape,
} from "@bufbuild/protobuf";
import type { ConnectError } from "@connectrpc/connect";
import { useQuery, type UseQueryOptions } from "@connectrpc/connect-query";
import type { SkipToken } from "@connectrpc/connect-query-core";
import type { UseQueryResult } from "@tanstack/react-query";

export function useApiQuery<
  I extends DescMessage,
  O extends DescMessage,
  SelectOutData = MessageShape<O>
>(
  schema: DescMethodUnary<I, O>,
  input?: SkipToken | MessageInitShape<I>,
  { transport, ...queryOptions }: UseQueryOptions<O, SelectOutData> = {}
): UseQueryResult<SelectOutData, ConnectError> {
  return useQuery<I, O, SelectOutData>(schema, input, {
    throwOnError: true,
    ...(transport && { transport }),
    ...queryOptions,
  });
}
