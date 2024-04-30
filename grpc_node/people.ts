/* eslint-disable */
import {
  type CallOptions,
  ChannelCredentials,
  Client,
  type ClientOptions,
  type ClientUnaryCall,
  type handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  type ServiceError,
  type UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "PeoplePackage";

export interface PeopleData {
  name: string;
  age: number;
  address: string;
}

export interface PeopleId {
  id: number;
}

function createBasePeopleData(): PeopleData {
  return { name: "", age: 0, address: "" };
}

export const PeopleData = {
  encode(message: PeopleData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.age !== 0) {
      writer.uint32(16).int32(message.age);
    }
    if (message.address !== "") {
      writer.uint32(26).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeopleData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeopleData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.age = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.address = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PeopleData {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      age: isSet(object.age) ? globalThis.Number(object.age) : 0,
      address: isSet(object.address) ? globalThis.String(object.address) : "",
    };
  },

  toJSON(message: PeopleData): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.age !== 0) {
      obj.age = Math.round(message.age);
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PeopleData>, I>>(base?: I): PeopleData {
    return PeopleData.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PeopleData>, I>>(object: I): PeopleData {
    const message = createBasePeopleData();
    message.name = object.name ?? "";
    message.age = object.age ?? 0;
    message.address = object.address ?? "";
    return message;
  },
};

function createBasePeopleId(): PeopleId {
  return { id: 0 };
}

export const PeopleId = {
  encode(message: PeopleId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeopleId {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeopleId();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PeopleId {
    return { id: isSet(object.id) ? globalThis.Number(object.id) : 0 };
  },

  toJSON(message: PeopleId): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PeopleId>, I>>(base?: I): PeopleId {
    return PeopleId.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PeopleId>, I>>(object: I): PeopleId {
    const message = createBasePeopleId();
    message.id = object.id ?? 0;
    return message;
  },
};

export type PeopleServiceService = typeof PeopleServiceService;
export const PeopleServiceService = {
  getData: {
    path: "/PeoplePackage.PeopleService/GetData",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PeopleId) => Buffer.from(PeopleId.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PeopleId.decode(value),
    responseSerialize: (value: PeopleData) => Buffer.from(PeopleData.encode(value).finish()),
    responseDeserialize: (value: Buffer) => PeopleData.decode(value),
  },
} as const;

export interface PeopleServiceServer extends UntypedServiceImplementation {
  getData: handleUnaryCall<PeopleId, PeopleData>;
}

export interface PeopleServiceClient extends Client {
  getData(request: PeopleId, callback: (error: ServiceError | null, response: PeopleData) => void): ClientUnaryCall;
  getData(
    request: PeopleId,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: PeopleData) => void,
  ): ClientUnaryCall;
  getData(
    request: PeopleId,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: PeopleData) => void,
  ): ClientUnaryCall;
}

export const PeopleServiceClient = makeGenericClientConstructor(
  PeopleServiceService,
  "PeoplePackage.PeopleService",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): PeopleServiceClient;
  service: typeof PeopleServiceService;
  serviceName: string;
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
