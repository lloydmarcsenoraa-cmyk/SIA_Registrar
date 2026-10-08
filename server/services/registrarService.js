const data = require("../data/mockData");

function getAll(type) {
  if (!Object.hasOwn(data, type)) {
    throw new Error("Unknown data type");
  }
  return data[type];
}

function getById(type, id) {
  return getAll(type).find(
    item => item.id === Number(id)
  ) || null;
}

function create(type, payload) {
  const records = getAll(type);

  const nextId = records.length
    ? Math.max(...records.map(item => item.id)) + 1
    : 1;

  const record = { ...payload, id: nextId };
  records.push(record);
  return record;
}

function update(type, id, payload) {
  const record = getById(type, id);
  if (!record) return null;

  Object.assign(record, payload, { id: record.id });
  return record;
}

function remove(type, id) {
  const records = getAll(type);
  const index = records.findIndex(
    item => item.id === Number(id)
  );

  if (index === -1) return null;

  return records.splice(index, 1)[0];
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
