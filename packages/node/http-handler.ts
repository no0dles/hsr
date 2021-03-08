export interface HttpHandler<TReq, TRes, TParams> {
  (req: TReq, params: TParams): Promise<TRes> | TRes
}
