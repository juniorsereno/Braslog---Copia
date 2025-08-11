type Serializable = unknown;
type Payload = { json: unknown };

export default {
  serialize: (data: Serializable) => ({ json: data, meta: {} as Record<string, never> }),
  deserialize: (payload: Payload) => payload.json,
};


