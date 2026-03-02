import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts"
import type { TopRoles } from "../../../shared/api/types"

type Props = {
  data: TopRoles[]
}

export function TopRolesChart({ data }: Props) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BarChart
        data={data}
        layout="vertical"
        style={{
          width: "100%",
          maxWidth: "700px",
          height: 350,
        }}
        responsive
        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
      >
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="role"
          width={200}
        />

        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[0, 2, 2, 0]}
        />
      </BarChart>
    </div>
  )
}