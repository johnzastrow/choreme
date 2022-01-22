lua << EOF
local dap = require('dap')
dap.configurations.typescript = {
  {
    name = 'Next.js Launch',
    type = 'node2',
    request = 'launch',
    runtimeExecutable = "npm",
    runtimeArgs = { "run", "dev" },
  }
}
vim.notify("hello")
EOF

echo "HELLOOOOOO"
