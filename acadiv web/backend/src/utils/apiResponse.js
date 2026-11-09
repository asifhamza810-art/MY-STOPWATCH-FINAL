function ok(res, data = null, meta = undefined, status = 200) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

function created(res, data, meta) {
  return ok(res, data, meta, 201);
}

function fail(res, message, status = 400, code = 'BAD_REQUEST', details) {
  const body = { success: false, error: { message, code } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
}

module.exports = { ok, created, fail };
