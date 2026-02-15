const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const sourceDir = path.join(__dirname, "../workspace/source");
const binariesDir = path.join(__dirname, "../workspace/binaries");
const sourceFile = path.join(sourceDir, "program.c");
const binaryFile = path.join(binariesDir, "program.out");

function executeCode(req, res) {
  try {
    const code = req.body && typeof req.body.code === "string" ? req.body.code : "";

    if (!code.trim()) {
      res.status(400).json({ success: false, error: "No code provided" });
      return;
    }

    if (/\bscanf\s*\(/i.test(code)) {
      res.status(400).json({
        success: false,
        error: "Runtime input is not allowed. Remove scanf usage."
      });
      return;
    }

    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(binariesDir, { recursive: true });
    fs.writeFileSync(sourceFile, code, "utf8");

    try {
      execSync(`gcc \"${sourceFile}\" -o \"${binaryFile}\"`, {
        stdio: "pipe",
        encoding: "utf8"
      });
    } catch (compileError) {
      const compileMessage = compileError && compileError.stderr
        ? String(compileError.stderr)
        : (compileError && compileError.message ? String(compileError.message) : "Compilation failed");

      res.status(200).json({ success: false, error: compileMessage.trim() || "Compilation failed" });
      return;
    }

    try {
      const stdout = execSync(
        `\"${binaryFile}\"`,
        {
          timeout: 5000,
          stdio: "pipe"
        }
      ).toString();

      return res.json({
        success: true,
        output: stdout
      });
    } catch (runtimeErr) {
      if (runtimeErr.signal === "SIGFPE" || runtimeErr.status === 136) {
        return res.json({
          success: false,
          error: "Runtime Error: Division by zero"
        });
      }

      if (runtimeErr.signal === "SIGSEGV" || runtimeErr.status === 139) {
        return res.json({
          success: false,
          error: "Runtime Error: Segmentation Fault"
        });
      }

      return res.json({
        success: false,
        error: "Runtime Error: Program crashed"
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = { executeCode };
