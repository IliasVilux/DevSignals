-- @param {String} $1:countryParam?
-- @param {String} $2:roleParam?
-- @param {Int} $3:limitParam

SELECT
  min(j.role) AS role,
  count(*)::int AS count
FROM "Job" j
JOIN "Country" c ON j."countryId" = c.id
WHERE ($1::text IS NULL OR c.code = $1::text)
  AND ($2::text IS NULL OR j.role ILIKE '%' || $2::text || '%')
  AND j.role IS NOT NULL
GROUP BY lower(trim(j.role))
ORDER BY count DESC
LIMIT $3::int;