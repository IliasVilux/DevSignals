-- @param {String} $1:countryParam?
-- @param {String} $2:roleParam?

WITH skill_counts AS (
  SELECT
    s.name::text AS name,
    s.category::text AS category,
    count(*)::int AS skill_count
  FROM "JobSkill" js
  JOIN "Job" j ON js."jobId" = j.id
  JOIN "Skill" s ON js."skillId" = s.id
  JOIN "Country" c ON j."countryId" = c.id
  WHERE ($1::text IS NULL OR c.code = $1::text)
    AND ($2::text IS NULL OR j.role ILIKE '%' || $2::text || '%')
  GROUP BY s.id, s.name, s.category
),
ranked AS (
  SELECT
    name,
    category,
    skill_count,
    SUM(skill_count) OVER (PARTITION BY category)::int AS category_count,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY skill_count DESC) AS rn
  FROM skill_counts
)
SELECT name, category, skill_count, category_count
FROM ranked
WHERE rn <= 5
ORDER BY category_count DESC, category, skill_count DESC;
