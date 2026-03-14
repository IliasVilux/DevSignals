-- @param {String} $1:countryParam?
-- @param {String} $2:roleParam?
-- @param {Int} $3:limitParam

SELECT
  s.name,
  s.category::text AS category,
  count(*)::int AS count
FROM "JobSkill" js
JOIN "Job" j ON js."jobId" = j.id
JOIN "Skill" s ON js."skillId" = s.id
JOIN "Country" c ON j."countryId" = c.id
WHERE ($1::text IS NULL OR c.code = $1::text)
  AND ($2::text IS NULL OR j.role ILIKE '%' || $2::text || '%')
GROUP BY s.id, s.name, s.category
ORDER BY count DESC
LIMIT $3::int;
