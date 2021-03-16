export interface HttpHandler<TReq, TRes, TParams> {
  (req: TReq, res: TRes, params: TParams): Promise<TRes> | TRes
}
