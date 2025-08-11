export default {
  serialize: (data) => ({ json: data, meta: {} }),
  deserialize: (payload) => payload.json,
};


