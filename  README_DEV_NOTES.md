## 🧹 Clean Test Instructions (Manual)

To start the Gleam project manually without emoji command confusion:

1. Start MongoDB:
   ```bash
   mongod --dbpath "C:\\Users\\yosri\\Downloads\\Brimind-VIBE\\generated\\Gleam\\data"
   ```

2. In a new terminal, navigate to the project directory:
   ```bash
   cd "C:\\Users\\yosri\\Downloads\\Brimind-VIBE\\generated\\Gleam"
   ```

3. Run the project:
   ```bash
   npm run start
   ```

4. Once you see ✅ `MongoDB connected successfully to gleam`, open:
   - http://localhost:3008/competitions/create → to create competitions
   - http://localhost:3009/api/competitions → to view backend API results

✅ This replaces emoji-based instructions that caused terminal parsing errors.