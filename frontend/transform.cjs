const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importRegex = /^import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"];$/gm;
const lazyImports = [];
let newCode = code.replace(importRegex, (match, p1, p2) => {
  if (['Login', 'Dashboard'].includes(p1) || p2 === 'Dashboard') {
    return match; // keep static
  }
  lazyImports.push(`const ${p1} = React.lazy(() => import('./${p2}'));`);
  return ''; // remove static import
});

newCode = "import React, { Suspense } from 'react';\n" + newCode;
newCode = newCode.replace("import Login from './Login';", "import Login from './Login';\n" + lazyImports.join('\n'));

newCode = newCode.replace(
  'return token ? children : <Navigate to="/login" replace />;',
  'return token ? <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>}>{children}</Suspense> : <Navigate to="/login" replace />;'
);

fs.writeFileSync('src/App.tsx', newCode);
console.log('App.tsx transformed');
