// backend/server.js
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const app = createApp({ basePath: "/api" });

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
