import {
    PieChart,
    Pie,
    Tooltip,
} from "recharts"
import type { RemoteDistribution } from "../../../shared/api/types"

type Props = RemoteDistribution

const COLORS = ["#3b82f6", "#1c53ac", "#202f46"]

export function RemoteDistributionChart({
    hybrid,
    remote,
    onsite,
}: Props) {
    const data = [
        { name: "Hybrid", value: hybrid, fill: COLORS[0] },
        { name: "Remote", value: remote, fill: COLORS[1] },
        { name: "Onsite", value: onsite, fill: COLORS[2] },
    ]

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <PieChart
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    aspectRatio: 1,
                }}
                responsive
            >
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    label={({ percent }) =>
                        `${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                />
                <Tooltip />
            </PieChart>
        </div>
    )
}