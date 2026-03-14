import app from "./app";
import { env } from "./config/env";
import { startScheduler } from "./ingestion/scheduler";

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startScheduler();
});
